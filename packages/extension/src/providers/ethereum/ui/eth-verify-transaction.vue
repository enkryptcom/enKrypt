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
                  TokenBalance == "~"
                    ? "~"
                    : $filters.formatFloatingPointValue(TokenBalance).value
                }}
                <span>{{ network.currencyName }}</span>
              </p>
              <p>
                {{ $filters.replaceWithEllipsis(account.address, 6, 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img :src="Options.faviconURL" />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ Options.domain }}</h4>
          </div>
        </div>

        <div
          v-if="!isApproval && decodedTx"
          class="provider-verify-transaction__amount"
        >
          <img :src="decodedTx?.tokenImage || network.icon" />

          <div class="provider-verify-transaction__amount-info">
            <h4>
              {{
                $filters.formatFloatingPointValue(
                  fromBase(
                    decodedTx?.tokenValue || "0x0",
                    decodedTx?.tokenDecimals || 18
                  )
                ).value
              }}
              <span>{{ decodedTx?.tokenName || network.currencyName }}</span>
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

        <div v-if="isApproval" class="provider-verify-transaction__error">
          <alert-icon />
          <p>
            Warning: you will allow this DApp to spend {{ approvalAmount }} of
            {{ decodedTx?.tokenName || network.currencyName }} at any time in
            the future. Please proceed only if you are trust this DApp.
          </p>
        </div>
      </div>

      <send-fee-select
        :in-swap="true"
        :selected="selectedFee"
        :fee="gasCostValues[selectedFee]"
        @open-popup="toggleSelectFee"
      />

      <div class="provider-verify-transaction__data">
        <a
          class="provider-verify-transaction__data-link"
          :class="{ open: isOpenData }"
          @click="toggleData"
          ><span>Show data</span> <right-chevron
        /></a>

        <div v-show="isOpenData" class="provider-verify-transaction__data-text">
          <p>Data Hex: {{ decodedTx?.dataHex || "0x" }}</p>
        </div>
      </div>

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
      <base-button title="Send" :click="approve" :disabled="isProcessing" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { ref, ComponentPublicInstance, onBeforeMount } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import RightChevron from "@action/icons/common/right-chevron.vue";
import BaseButton from "@action/components/base-button/index.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import SendFeeSelect from "@/providers/common/ui/send-transaction/send-fee-select.vue";
import HardwareWalletMsg from "@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { DEFAULT_EVM_NETWORK, getNetworkByName } from "@/libs/utils/networks";
import { DecodedTx, EthereumTransaction } from "../libs/transaction/types";
import Transaction from "@/providers/ethereum/libs/transaction";
import Web3Eth from "web3-eth";
import { EvmNetwork } from "../types/evm-network";
import { decodeTx } from "../libs/transaction/decoder";
import { ProviderRequestOptions } from "@/types/provider";
import BigNumber from "bignumber.js";
import { GasFeeType, GasPriceTypes } from "@/providers/common/types";
import MarketData from "@/libs/market-data";
import { defaultGasCostVals } from "@/providers/common/libs/default-vals";
import { EnkryptAccount } from "@enkryptcom/types";
import { TransactionSigner } from "./libs/signer";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { generateAddress } from "ethereumjs-util";
import ActivityState from "@/libs/activity-state";
import { bigIntToBuffer, bigIntToHex, fromBase } from "@enkryptcom/utils";
import broadcastTx from "../libs/tx-broadcaster";
import TokenSigs from "../libs/transaction/lists/tokenSigs";
import AlertIcon from "@action/icons/send/alert-icon.vue";

const isProcessing = ref(false);
const isOpenSelectFee = ref(false);
const providerVerifyTransactionScrollRef = ref<ComponentPublicInstance>();
const isOpenData = ref(false);
const TokenBalance = ref<string>("~");
const fiatValue = ref<string>("~");
const decodedTx = ref<DecodedTx>();
const isApproval = ref(false);
const approvalAmount = ref("");
const network = ref<EvmNetwork>(DEFAULT_EVM_NETWORK);
const marketdata = new MarketData();
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const account = ref<EnkryptAccount>({
  name: "",
  address: "",
} as EnkryptAccount);
const identicon = ref<string>("");
const windowPromise = WindowPromiseHandler(3);
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.REGULAR);

defineExpose({ providerVerifyTransactionScrollRef });

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![2]
  )) as EvmNetwork;
  account.value = Request.value.params![1] as EnkryptAccount;
  identicon.value = network.value.identicon(account.value.address);
  Options.value = options;
  if (network.value.api) {
    const api = await network.value.api();
    const balance = await api.getBalance(account.value.address);
    TokenBalance.value = fromBase(balance, network.value.decimals);
  }
  await decodeTx(
    Request.value.params![0] as EthereumTransaction,
    network.value as EvmNetwork
  ).then((decoded) => {
    if (decoded.decoded && decoded.dataHex.startsWith(TokenSigs.approve)) {
      isApproval.value = true;
      if (
        decoded.decodedHex![1] ===
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      ) {
        approvalAmount.value = "any amount";
      } else {
        approvalAmount.value = fromBase(
          decoded.decodedHex![1],
          decoded.tokenDecimals
        );
      }
    }
    decodedTx.value = decoded;
    fiatValue.value = new BigNumber(
      fromBase(decoded.tokenValue, decoded.tokenDecimals)
    )
      .times(decoded.currentPriceUSD)
      .toFixed(2);
  });
  const web3 = new Web3Eth(network.value.node);
  const tx = new Transaction(
    Request.value.params![0] as EthereumTransaction,
    web3
  );
  await tx.getGasCosts().then(async (gasvals) => {
    let nativeVal = "0";
    if (network.value.coingeckoID) {
      await marketdata
        .getTokenValue("1", network.value.coingeckoID, "USD")
        .then((val) => (nativeVal = val));
    }
    const getConvertedVal = (type: GasPriceTypes) =>
      fromBase(gasvals[type], network.value.decimals);

    gasCostValues.value = {
      [GasPriceTypes.ECONOMY]: {
        nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.ECONOMY))
          .times(nativeVal)
          .toString(),
        nativeSymbol: network.value.currencyName,
        fiatSymbol: "USD",
      },
      [GasPriceTypes.REGULAR]: {
        nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.REGULAR))
          .times(nativeVal)
          .toString(),
        nativeSymbol: network.value.currencyName,
        fiatSymbol: "USD",
      },
      [GasPriceTypes.FAST]: {
        nativeValue: getConvertedVal(GasPriceTypes.FAST),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST))
          .times(nativeVal)
          .toString(),
        nativeSymbol: network.value.currencyName,
        fiatSymbol: "USD",
      },
      [GasPriceTypes.FASTEST]: {
        nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FASTEST))
          .times(nativeVal)
          .toString(),
        nativeSymbol: network.value.currencyName,
        fiatSymbol: "USD",
      },
    };
    selectedFee.value = GasPriceTypes.REGULAR;
  });
});

const approve = async () => {
  isProcessing.value = true;
  const { Request, Resolve } = await windowPromise;
  const web3 = new Web3Eth(network.value.node);
  const tx = new Transaction(
    Request.value.params![0] as EthereumTransaction,
    web3
  );
  tx.getFinalizedTransaction({ gasPriceType: selectedFee.value }).then(
    (finalizedTx) => {
      const activityState = new ActivityState();
      TransactionSigner({
        account: account.value,
        network: network.value,
        payload: finalizedTx,
      }).then((tx) => {
        const txActivity: Activity = {
          from: account.value.address,
          to: tx.to
            ? tx.to.toString()
            : `0x${generateAddress(
                tx.getSenderAddress().toBuffer(),
                bigIntToBuffer(tx.nonce)
              ).toString("hex")}`,
          isIncoming: tx.getSenderAddress().toString() === tx.to?.toString(),
          network: network.value.name,
          status: ActivityStatus.pending,
          timestamp: new Date().getTime(),
          token: {
            decimals: decodedTx.value?.tokenDecimals || 18,
            icon: decodedTx.value?.tokenImage || "",
            name: decodedTx.value?.tokenName || "Unknown",
            symbol: decodedTx.value?.tokenSymbol || "UKNWN",
            price: decodedTx.value?.currentPriceUSD.toString() || "0",
          },
          type: ActivityType.transaction,
          value: decodedTx.value?.tokenValue || "0x0",
          transactionHash: "",
        };
        const onHash = (hash: string) => {
          activityState
            .addActivities(
              [
                {
                  ...txActivity,
                  ...{
                    transactionHash: hash,
                    nonce: bigIntToHex(finalizedTx.nonce),
                  },
                },
              ],
              {
                address: txActivity.from,
                network: network.value.name,
              }
            )
            .then(() => {
              Resolve.value({
                result: JSON.stringify(hash),
              });
            });
        };
        broadcastTx("0x" + tx.serialize().toString("hex"), network.value.name)
          .then(onHash)
          .catch(() => {
            web3
              .sendSignedTransaction("0x" + tx.serialize().toString("hex"))
              .on("transactionHash", onHash)
              .on("error", (error) => {
                txActivity.status = ActivityStatus.failed;
                activityState
                  .addActivities([txActivity], {
                    address: txActivity.from,
                    network: network.value.name,
                  })
                  .then(() => {
                    Resolve.value({
                      error: getCustomError(error.message),
                    });
                  });
              });
          })
          .catch((err) => {
            Resolve.value(err);
          });
      });
    }
  );
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
const toggleData = () => {
  isOpenData.value = !isOpenData.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "@/providers/common/ui/styles/verify-transaction.less";
</style>
