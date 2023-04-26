<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
      <div class="common-popup__network">
        <img :src="network.icon" />
        <p>{{ network.name_long }}</p>
      </div>
    </template>

    <template #content>
      <h2>Verify transaction</h2>
      <hardware-wallet-msg :wallet-type="account.walletType" />
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__account">
          <img :src="identicon" />
          <div class="provider-verify-transaction__account-info">
            <h4>{{ account.name }}</h4>
            <div>
              <p>
                {{
                  $filters.formatFloatingPointValue(
                    fromBase(TokenBalance, network.decimals)
                  ).value
                }}
                <span>{{ network.currencyName }}</span>
              </p>
              <p>
                {{
                  $filters.replaceWithEllipsis(
                    account.address
                      ? network.displayAddress(account.address)
                      : "",
                    6,
                    4
                  )
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img :src="Options.faviconURL" />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ Options.title }}</h4>
            <p>{{ Options.domain }}</p>
          </div>
        </div>

        <div class="provider-verify-transaction__amount">
          <img :src="network.icon" />

          <div class="provider-verify-transaction__amount-info">
            <h4>
              {{
                $filters.formatFloatingPointValue(
                  fromBase(tx.value.toString(), network.decimals)
                ).value
              }}
              <span>{{ network.currencyName }}</span>
            </h4>
            <p>
              ${{
                fiatValue !== "~"
                  ? $filters.formatFiatValue(fiatValue).value
                  : fiatValue
              }}
            </p>
          </div>
        </div>

        <div
          v-if="!hasEnoughBalance"
          class="provider-verify-transaction__error"
        >
          <alert-icon />
          <p>You don't have enough balance for this transaction</p>
        </div>
      </div>

      <send-fee-select
        :in-swap="true"
        :selected="selectedFee"
        :fee="gasCostValues[selectedFee]"
        @open-popup="toggleSelectFee"
      />

      <transaction-fee-view
        :fees="gasCostValues"
        :show-fees="isOpenSelectFee"
        :selected="selectedFee"
        :is-header="true"
        :is-popup="true"
        @close-popup="toggleSelectFee"
        @gas-type-changed="selectFee"
      />
    </template>

    <template #button-left>
      <base-button
        title="Decline"
        :click="deny"
        :no-background="true"
        :disabled="isProcessing"
      />
    </template>

    <template #button-right>
      <base-button
        title="Sign"
        :click="approve"
        :disabled="isProcessing || !hasEnoughBalance"
      />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { ref, ComponentPublicInstance, onBeforeMount } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import SendFeeSelect from "@/providers/common/ui/send-transaction/send-fee-select.vue";
import HardwareWalletMsg from "@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue";
import AlertIcon from "@action/icons/send/alert-icon.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { DEFAULT_BTC_NETWORK, getNetworkByName } from "@/libs/utils/networks";
import { fromBase, toBase } from "@enkryptcom/utils";
import { ProviderRequestOptions } from "@/types/provider";
import { GasFeeType } from "./types";
import MarketData from "@/libs/market-data";
import { defaultGasCostVals } from "@/providers/common/libs/default-vals";
import { EnkryptAccount } from "@enkryptcom/types";
import { TransactionSigner } from "./libs/signer";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import ActivityState from "@/libs/activity-state";
import { BitcoinNetwork } from "../types/bitcoin-network";
import { GasPriceTypes } from "@/providers/common/types";
import { RPCTxType } from "../types";
import BitcoinAPI from "@/providers/bitcoin/libs/api";
import { HaskoinUnspentType } from "../types";
import { calculateSize } from "./libs/tx-size";
import { getGasCostValues } from "../libs/utils";
import { computed } from "@vue/reactivity";
import { toBN } from "web3-utils";
import { BTCTxInfo } from "./types";

const isProcessing = ref(false);
const isOpenSelectFee = ref(false);
const providerVerifyTransactionScrollRef = ref<ComponentPublicInstance>();
const TokenBalance = ref<string>("0");
const fiatValue = ref<string>("~");
const nativePrice = ref<string>("0");
const network = ref<BitcoinNetwork>(DEFAULT_BTC_NETWORK);
const marketdata = new MarketData();
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const account = ref<EnkryptAccount>({
  name: "",
  address: "",
} as EnkryptAccount);
const identicon = ref<string>("");
const windowPromise = WindowPromiseHandler(3);
const tx = ref<RPCTxType>({
  to: "",
  value: 0,
});
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});
const accountUTXOs = ref<HaskoinUnspentType[]>([]);
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.ECONOMY);

defineExpose({ providerVerifyTransactionScrollRef });

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![2]
  )) as BitcoinNetwork;
  account.value = Request.value.params![1] as EnkryptAccount;
  tx.value = Request.value.params![0];
  identicon.value = network.value.identicon(account.value.address);
  Options.value = options;
  if (network.value.api) {
    const api = await network.value.api();
    TokenBalance.value = await api.getBalance(account.value.address);
  }
  if (network.value.coingeckoID) {
    await marketdata
      .getTokenValue("1", network.value.coingeckoID, "USD")
      .then((val) => (nativePrice.value = val));
  }
  selectedFee.value = GasPriceTypes.ECONOMY;
  setBaseCosts();
});
const hasEnoughBalance = computed(() => {
  return toBN(TokenBalance.value).gte(
    toBN(tx.value.value).add(
      toBN(
        toBase(
          gasCostValues.value[selectedFee.value].nativeValue,
          network.value.decimals!
        )
      )
    )
  );
});

const setTransactionFees = (byteSize: number) => {
  getGasCostValues(
    network.value as BitcoinNetwork,
    byteSize,
    nativePrice.value,
    network.value.decimals,
    network.value.currencyName
  ).then((val) => (gasCostValues.value = val));
};

const setBaseCosts = () => {
  updateUTXOs();
};

const updateUTXOs = async () => {
  const api = (await network.value.api()) as BitcoinAPI;
  return api.getUTXOs(account.value.address).then((utxos) => {
    accountUTXOs.value = utxos;
    const txSize = calculateSize(
      {
        input_count: accountUTXOs.value.length,
      },
      {
        p2wpkh_output_count: 2,
      }
    );
    setTransactionFees(Math.ceil(txSize.txVBytes));
  });
};

const getTxInfo = () => {
  const txInfo: BTCTxInfo = {
    inputs: [],
    outputs: [],
  };
  accountUTXOs.value.forEach((u) => {
    txInfo.inputs.push({
      hash: u.txid,
      index: u.index,
      witnessUtxo: {
        script: u.pkscript,
        value: u.value,
      },
    });
  });
  const balance = toBN(TokenBalance.value);
  const toAmount = toBN(tx.value.value.toString());
  const currentFee = toBN(
    toBase(
      gasCostValues.value[selectedFee.value].nativeValue,
      network.value.decimals
    )
  );
  const remainder = balance.sub(toAmount).sub(currentFee);

  txInfo.outputs.push({
    address: tx.value.to,
    value: tx.value.value,
  });

  if (remainder.gtn(0)) {
    txInfo.outputs.push({
      address: network.value.displayAddress(account.value.address),
      value: remainder.toNumber(),
    });
  }
  return txInfo;
};

const approve = async () => {
  isProcessing.value = true;
  const { Resolve } = await windowPromise;

  isProcessing.value = true;
  const txActivity: Activity = {
    from: network.value.displayAddress(account.value.address),
    to: tx.value.to,
    isIncoming:
      tx.value.to === network.value.displayAddress(account.value.address),
    network: network.value.name,
    status: ActivityStatus.pending,
    timestamp: new Date().getTime(),
    token: {
      decimals: network.value.decimals,
      icon: network.value.icon,
      name: network.value.name_long,
      symbol: network.value.currencyName,
      price: nativePrice.value,
    },
    type: ActivityType.transaction,
    value: tx.value.value.toString(),
    transactionHash: "",
  };
  const activityState = new ActivityState();
  const api = (await network.value.api()) as BitcoinAPI;
  TransactionSigner({
    account: account.value!,
    network: network.value as BitcoinNetwork,
    payload: getTxInfo(),
  })
    .then((signedTx) => {
      api
        .broadcastTx(signedTx.extractTransaction().toHex())
        .then(() => {
          activityState.addActivities(
            [
              {
                ...txActivity,
                ...{ transactionHash: signedTx.extractTransaction().getId() },
              },
            ],
            {
              address: network.value.displayAddress(account.value.address),
              network: network.value.name,
            }
          );
          Resolve.value({
            result: JSON.stringify(signedTx.extractTransaction().getId()),
          });
        })
        .catch((error) => {
          txActivity.status = ActivityStatus.failed;
          activityState.addActivities([txActivity], {
            address: network.value.displayAddress(account.value.address),
            network: network.value.name,
          });
          Resolve.value({
            error: getCustomError(error.message),
          });
        });
    })
    .catch((error) => {
      Resolve.value({
        error: getCustomError(error.message),
      });
    });
};
const deny = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectFee.value;
};
const selectFee = (type: GasPriceTypes) => {
  selectedFee.value = type;
  toggleSelectFee();
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "./styles/verify-transaction.less";
</style>
