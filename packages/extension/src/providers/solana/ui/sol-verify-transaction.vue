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
                {{
                  $filters.replaceWithEllipsis(
                    network.displayAddress(account.address),
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
          <img :src="Options.faviconURL || network.icon" />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ Options.domain }}</h4>
          </div>
        </div>

        <div
          v-for="(item, index) in balanceChanges"
          :key="index"
          class="provider-verify-transaction__amount"
        >
          <img :src="item.icon" />

          <div class="provider-verify-transaction__amount-info">
            <h4>
              {{ parseFloat(item.change) < 0 ? "-" : "" }}
              {{
                $filters.formatFloatingPointValue(
                  Math.abs(parseFloat(item.change))
                ).value
              }}
              <span>{{ item.name }}</span>
            </h4>
            <p>
              {{ parseFloat(item.change) < 0 ? "-" : "" }}
              ${{
                $filters.formatFiatValue(Math.abs(parseFloat(item.usdval)))
                  .value
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
      <p v-if="errorMsg != ''" class="provider-verify-transaction__error">
        {{ errorMsg }}
      </p>
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
        title="Send"
        :click="approve"
        :disabled="isProcessing || errorMsg != ''"
      />
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
import {
  DEFAULT_EVM_NETWORK,
  DEFAULT_SOLANA_NETWORK,
  getNetworkByName,
} from "@/libs/utils/networks";
import Web3Eth from "web3-eth";
import { ProviderRequestOptions } from "@/types/provider";
import BigNumber from "bignumber.js";
import { GasFeeType, GasPriceTypes } from "@/providers/common/types";
import MarketData from "@/libs/market-data";
import { defaultGasCostVals } from "@/providers/common/libs/default-vals";
import { EnkryptAccount } from "@enkryptcom/types";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { generateAddress, bigIntToBytes } from "@ethereumjs/util";
import ActivityState from "@/libs/activity-state";
import {
  bigIntToHex,
  fromBase,
  bufferToHex,
  hexToBuffer,
} from "@enkryptcom/utils";
import AlertIcon from "@action/icons/send/alert-icon.vue";
import { NetworkNames } from "@enkryptcom/types";
import { trackSendEvents } from "@/libs/metrics";
import { SendEventType } from "@/libs/metrics/types";
import { SolanaNetwork } from "../types/sol-network";
import SolanaAPI from "@/providers/solana/libs/api";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { SolSignTransactionRequest } from "./types";
import sendUsingInternalMessengers from "@/libs/messenger/internal-messenger";
import { InternalMethods } from "@/types/messenger";
import {
  AccountLayout,
  ACCOUNT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import { toBN } from "web3-utils";
import { NATIVE_TOKEN_ADDRESS } from "@/providers/ethereum/libs/common";

const isProcessing = ref(false);
const isOpenSelectFee = ref(false);
const providerVerifyTransactionScrollRef = ref<ComponentPublicInstance>();
const isOpenData = ref(false);
const TokenBalance = ref<string>("~");
const fiatValue = ref<string>("~");
const decodedTx = ref();
const isApproval = ref(false);
const approvalAmount = ref("");
const network = ref<SolanaNetwork>(DEFAULT_SOLANA_NETWORK);
const marketdata = new MarketData();
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const errorMsg = ref("");
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
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.ECONOMY);
const solConnection = ref<SolanaAPI>();
const Tx = ref<VersionedTransaction>();
const accountPubkey = ref<PublicKey>();
const balanceChanges = ref<
  {
    name: string;
    symbol: string;
    change: string;
    icon: string;
    usdval: string;
  }[]
>([]);
defineExpose({ providerVerifyTransactionScrollRef });

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![2]
  )) as SolanaNetwork;
  selectedFee.value = GasPriceTypes.ECONOMY;
  account.value = Request.value.params![1] as EnkryptAccount;
  accountPubkey.value = new PublicKey(
    bs58.encode(hexToBuffer(account.value.address))
  );
  identicon.value = network.value.identicon(account.value.address);
  Options.value = options;
  if (network.value.api) {
    const api = await network.value.api();
    const balance = await api.getBalance(account.value.address);
    TokenBalance.value = fromBase(balance, network.value.decimals);
  }
  solConnection.value = (await network.value.api()).api as SolanaAPI;
  const txMessage = JSON.parse(
    Request.value.params![0]
  ) as SolSignTransactionRequest;
  Tx.value = VersionedTransaction.deserialize(hexToBuffer(txMessage.hex));
  solConnection.value.web3.getFeeForMessage(Tx.value.message).then((fee) => {
    const getConvertedVal = () =>
      fromBase(fee.value!.toString(), network.value.decimals);
    marketdata
      .getTokenValue("1", network.value.coingeckoID!, "USD")
      .then((val) => {
        const nativeVal = val;
        gasCostValues.value[GasPriceTypes.ECONOMY] = {
          nativeValue: getConvertedVal(),
          fiatValue: new BigNumber(getConvertedVal())
            .times(nativeVal!)
            .toString(),
          nativeSymbol: network.value.currencyName,
          fiatSymbol: "USD",
        };
      });
  });
  solConnection.value.web3
    .simulateTransaction(Tx.value, {
      accounts: {
        addresses: [
          ...Tx.value.message.staticAccountKeys.map((k) => k.toBase58()),
        ],
        encoding: "base64",
      },
    })
    .then((result) => {
      const balanceValues = [
        {
          contract: NATIVE_TOKEN_ADDRESS,
          amount: BigInt(result.value.accounts![0]!.lamports),
        },
      ];
      const balances = result.value
        .accounts!.filter((a) => {
          const data = Buffer.from(a!.data[0], "base64");
          return (
            a!.owner === TOKEN_PROGRAM_ID.toBase58() &&
            data.length === ACCOUNT_SIZE
          );
        })
        .map((a) => {
          const data = Buffer.from(a!.data[0], "base64");
          return AccountLayout.decode(data);
        })
        .filter(
          (val) => val.owner.toBase58() === accountPubkey.value!.toBase58()
        )
        .map((val) => {
          return {
            contract: val.mint.toBase58(),
            amount: val.amount,
          };
        });
      balanceValues.push(...balances);
      network.value
        .getAllTokenInfo(accountPubkey.value!.toBase58())
        .then((allTokens) => {
          for (const balance of balanceValues) {
            let foundToken = false;
            allTokens.forEach((t) => {
              if (t.contract! === balance.contract) {
                foundToken = true;
                const change = fromBase(
                  toBN(balance.amount.toString())
                    .sub(toBN(t.balance))
                    .toString(),
                  t.decimals
                );
                balanceChanges.value.push({
                  change,
                  name: t.name,
                  symbol: t.symbol,
                  icon: t.icon,
                  usdval: (parseFloat(t.value) * parseFloat(change)).toString(),
                });
              }
            });
            if (!foundToken) {
              solConnection
                .value!.getTokenInfo(balance.contract)
                .then(async (info) => {
                  let usdVal = 0;
                  let icon = network.value.icon;
                  if (network.value.coingeckoPlatform) {
                    const mdata = await marketdata.getMarketInfoByContracts(
                      [balance.contract],
                      network.value.coingeckoPlatform
                    );
                    if (mdata[balance.contract]) {
                      usdVal = mdata[balance.contract]!.current_price;
                      icon = mdata[balance.contract]!.image;
                    }
                  }
                  const change = fromBase(
                    toBN(balance.amount.toString()).toString(),
                    info.decimals
                  );
                  balanceChanges.value.push({
                    change,
                    name: info.name,
                    symbol: info.symbol,
                    icon,
                    usdval: (usdVal * parseFloat(change)).toString(),
                  });
                });
            }
          }
        });
    });
  // const msgToSign = Tx.value!.message.serialize();
  // const feePayer = new PublicKey(
  //   network.value.displayAddress(account.value.address)
  // );
  // sendUsingInternalMessengers({
  //   method: InternalMethods.sign,
  //   params: [bufferToHex(msgToSign), account.value!],
  // }).then((res) => {
  //   if (res.error) return res;
  //   Tx.value!.addSignature(feePayer, hexToBuffer(JSON.parse(res.result!)));
  //   solConnection.value!.web3.simulateTransaction(Tx.value!).then(console.log);
  //   // Resolve.value({
  //   //   result: JSON.stringify(bufferToHex(Tx.value!.serialize())),
  //   // });
  // });
  // await tx
  //   .getGasCosts()
  //   .then(async (gasvals) => {
  //     let nativeVal = "0";
  //     if (network.value.coingeckoID) {
  //       await marketdata
  //         .getTokenValue("1", network.value.coingeckoID, "USD")
  //         .then((val) => (nativeVal = val));
  //     }
  //     const getConvertedVal = (type: GasPriceTypes) =>
  //       fromBase(gasvals[type], network.value.decimals);

  //     gasCostValues.value = {
  //       [GasPriceTypes.ECONOMY]: {
  //         nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
  //         fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.ECONOMY))
  //           .times(nativeVal)
  //           .toString(),
  //         nativeSymbol: network.value.currencyName,
  //         fiatSymbol: "USD",
  //       },
  //       [GasPriceTypes.REGULAR]: {
  //         nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
  //         fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.REGULAR))
  //           .times(nativeVal)
  //           .toString(),
  //         nativeSymbol: network.value.currencyName,
  //         fiatSymbol: "USD",
  //       },
  //       [GasPriceTypes.FAST]: {
  //         nativeValue: getConvertedVal(GasPriceTypes.FAST),
  //         fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST))
  //           .times(nativeVal)
  //           .toString(),
  //         nativeSymbol: network.value.currencyName,
  //         fiatSymbol: "USD",
  //       },
  //       [GasPriceTypes.FASTEST]: {
  //         nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
  //         fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FASTEST))
  //           .times(nativeVal)
  //           .toString(),
  //         nativeSymbol: network.value.currencyName,
  //         fiatSymbol: "USD",
  //       },
  //     };
  //   selectedFee.value = GasPriceTypes.REGULAR;
  // })
  // .catch((e) => {
  //   errorMsg.value = e.message;
  // });
});

const approve = async () => {
  const { Resolve } = await windowPromise;
  isProcessing.value = true;
  trackSendEvents(SendEventType.SendAPIApprove, {
    network: network.value.name,
  });
  console.log(Tx.value);
  const msgToSign = Tx.value!.message.serialize();
  const feePayer = new PublicKey(
    network.value.displayAddress(account.value.address)
  );
  sendUsingInternalMessengers({
    method: InternalMethods.sign,
    params: [bufferToHex(msgToSign), account.value!],
  }).then((res) => {
    if (res.error) return res;
    Tx.value!.addSignature(feePayer, hexToBuffer(JSON.parse(res.result!)));
    Resolve.value({
      result: JSON.stringify(bufferToHex(Tx.value!.serialize())),
    });
  });
  // const { Request, Resolve } = await windowPromise;
  // const web3 = new Web3Eth(network.value.node);
  // const tx = new Transaction(
  //   Request.value.params![0] as EthereumTransaction,
  //   web3
  // );
  // tx.getFinalizedTransaction({ gasPriceType: selectedFee.value }).then(
  //   (finalizedTx) => {
  //     const activityState = new ActivityState();
  //     TransactionSigner({
  //       account: account.value,
  //       network: network.value,
  //       payload: finalizedTx,
  //     })
  //       .then((tx) => {
  //         const txActivity: Activity = {
  //           from: account.value.address,
  //           to: tx.to
  //             ? tx.to.toString()
  //             : bufferToHex(
  //                 generateAddress(
  //                   tx.getSenderAddress().toBytes(),
  //                   bigIntToBytes(tx.nonce)
  //                 )
  //               ),
  //           isIncoming: tx.getSenderAddress().toString() === tx.to?.toString(),
  //           network: network.value.name,
  //           status: ActivityStatus.pending,
  //           timestamp: new Date().getTime(),
  //           token: {
  //             decimals: decodedTx.value?.tokenDecimals || 18,
  //             icon: decodedTx.value?.tokenImage || "",
  //             name: decodedTx.value?.tokenName || "Unknown",
  //             symbol: decodedTx.value?.tokenSymbol || "UKNWN",
  //             price: decodedTx.value?.currentPriceUSD.toString() || "0",
  //           },
  //           type: ActivityType.transaction,
  //           value: decodedTx.value?.tokenValue || "0x0",
  //           transactionHash: "",
  //         };
  //         const onHash = (hash: string) => {
  //           trackSendEvents(SendEventType.SendAPIComplete, {
  //             network: network.value.name,
  //           });
  //           activityState
  //             .addActivities(
  //               [
  //                 {
  //                   ...txActivity,
  //                   ...{
  //                     transactionHash: hash,
  //                     nonce: bigIntToHex(finalizedTx.nonce),
  //                   },
  //                 },
  //               ],
  //               {
  //                 address: txActivity.from,
  //                 network: network.value.name,
  //               }
  //             )
  //             .then(() => {
  //               Resolve.value({
  //                 result: JSON.stringify(hash),
  //               });
  //             });
  //         };
  //         broadcastTx(bufferToHex(tx.serialize()), network.value.name)
  //           .then(onHash)
  //           .catch(() => {
  //             web3
  //               .sendSignedTransaction(bufferToHex(tx.serialize()))
  //               .on("transactionHash", onHash)
  //               .on("error", (error) => {
  //                 txActivity.status = ActivityStatus.failed;
  //                 activityState
  //                   .addActivities([txActivity], {
  //                     address: txActivity.from,
  //                     network: network.value.name,
  //                   })
  //                   .then(() => {
  //                     trackSendEvents(SendEventType.SendAPIFailed, {
  //                       network: network.value.name,
  //                       error: error.message,
  //                     });
  //                     Resolve.value({
  //                       error: getCustomError(error.message),
  //                     });
  //                   });
  //               });
  //           });
  //       })
  //       .catch((err) => {
  //         trackSendEvents(SendEventType.SendAPIFailed, {
  //           network: network.value.name,
  //           error: err.error,
  //         });
  //         Resolve.value(err);
  //       });
  //   }
  // );
};
const deny = async () => {
  trackSendEvents(SendEventType.SendAPIDecline, {
    network: network.value.name,
  });
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
