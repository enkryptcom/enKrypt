<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
      <div class="common-popup__network">
        <img :src="network ? network.icon : defaultNetwork.icon" />
        <p>{{ network ? network.name_long : "" }}</p>
      </div>
    </template>

    <template #content>
      <h2>Verify transaction</h2>
      <hardware-wallet-msg :wallet-type="account?.walletType" />
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__account">
          <img
            :src="
              network
                ? network.identicon(account!.address)
                : defaultNetwork.icon
            "
          />
          <div class="provider-verify-transaction__account-info">
            <h4>{{ account?.name || "" }}</h4>
            <div>
              <p v-if="userBalance">
                {{ formatBalance(userBalance.balance) }}
                <span> {{ userBalance.symbol }} </span>
              </p>
              <p v-else>~</p>
              <p>
                {{
                  network
                    ? $filters.replaceWithEllipsis(
                        network.displayAddress(account!.address),
                        4,
                        4
                      )
                    : $filters.replaceWithEllipsis(account?.address)
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!networkIsUnknown" class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img :src="network ? network.icon : defaultNetwork.icon" />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ network ? network.name_long : "Loading.." }}</h4>
            <p>
              {{ Options.url }}
            </p>
          </div>
        </div>
      </div>

      <component :is="txView" v-if="!isProcessing" v-bind="txViewProps" />

      <div v-if="!networkIsUnknown" class="provider-verify-transaction__fee">
        <div class="provider-verify-transaction__fee-value">
          <p class="provider-verify-transaction__fee-value-fiat">
            Fee: {{ txFee ? `${formatBalance(txFee)}` : "~" }}
          </p>
          <!-- <p class="provider-verify-transaction__fee-value-crypto">
            0.0019
            <span>DOT</span>
          </p> -->
        </div>
      </div>

      <best-offer-error v-if="insufficientBalance" :not-enought-verify="true" />

      <div class="provider-verify-transaction__data">
        <a
          class="provider-verify-transaction__data-link"
          :class="{ open: isOpenData }"
          @click="toggleData"
          ><span>Show data</span> <right-chevron
        /></a>

        <div v-show="isOpenData" class="provider-verify-transaction__data-text">
          <div v-if="callData">
            <p>
              Call:
              {{
                callData.method
                  ? `${callData.section}.${callData.method}`
                  : "Loading"
              }}
            </p>
            <p>Parameters:</p>
            <li
              v-for="(item, index) in Object.keys(callData.args ?? {})"
              :key="index"
            >
              {{ `${item}: ${JSON.stringify(callData.args[item])}` }}
            </li>
          </div>
          <div v-else>
            <p>Loading</p>
          </div>
        </div>
      </div>
    </template>

    <template #button-left>
      <base-button
        title="Decline"
        :click="deny"
        :no-background="true"
        :disabled="isSigning"
      />
    </template>

    <template #button-right>
      <base-button title="Sign" :click="approve" :disabled="isSigning" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, shallowRef, watch } from "vue";
import { base64Decode } from "@polkadot/util-crypto";
import SignLogo from "@action/icons/common/sign-logo.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import RightChevron from "@action/icons/common/right-chevron.vue";
import BaseButton from "@action/components/base-button/index.vue";
import BestOfferError from "@action/views/swap/views/swap-best-offer/components/swap-best-offer-block/components/best-offer-error.vue";
import HardwareWalletMsg from "@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue";
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { TypeRegistry, Metadata } from "@polkadot/types";
import { Registry, SignerPayloadJSON } from "@polkadot/types/types";
import MetadataStorage from "../libs/metadata-storage";
import { CallData, FrameSystemAccountInfo } from "./types";
import { SubstrateNetwork } from "../types/substrate-network";
import { BaseNetwork } from "@/types/base-network";
import BlindVerifyView from "./custom-views/blind-approvetx.vue";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { getViewAndProps } from "./custom-views";
import SubstrateAPI from "../libs/api";
import BigNumber from "bignumber.js";
import { ProviderRequestOptions } from "@/types/provider";
import { EnkryptAccount } from "@enkryptcom/types";
import { TransactionSigner } from "./libs/signer";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { ApiPromise } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import ActivityState from "@/libs/activity-state";
import Polkadot from "@/providers/polkadot/networks/polkadot";
import { getAllNetworks } from "@/libs/utils/networks";
import { addNetworkSelectMetrics } from "@/libs/metrics";

const windowPromise = WindowPromiseHandler(2);

const providerVerifyTransactionScrollRef = ref(null);
const isOpenData = ref(false);
const callData = ref<CallData>();
const network = ref<BaseNetwork | undefined>();
const networkIsUnknown = ref(false);
const txView = shallowRef<any>(BlindVerifyView);
const account = ref<EnkryptAccount>();
const txFee = ref<BigNumber>();
const userBalance = ref<{ balance: BigNumber; symbol: string }>();
const insufficientBalance = ref(false);
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});
const isProcessing = ref(false);
const isSigning = ref(false);
const defaultNetwork = Polkadot;
const metadataStorage = new MetadataStorage();

const txViewProps = ref({});

onBeforeMount(async () => {
  isProcessing.value = true;
  const { Request, options } = await windowPromise;
  Options.value = options;

  const reqPayload = Request.value.params![0] as SignerPayloadJSON;
  const reqAccount = Request.value.params![1] as EnkryptAccount;
  const targetNetwork = (await getAllNetworks()).find(
    (network) =>
      (network as SubstrateNetwork).genesisHash === reqPayload.genesisHash
  );

  if (targetNetwork) {
    network.value = targetNetwork;
    addNetworkSelectMetrics(targetNetwork.provider, targetNetwork.name, 1);
  } else {
    networkIsUnknown.value = true;
  }

  setAccount(reqAccount);
  const metadata = await metadataStorage.getMetadata(reqPayload.genesisHash);

  if (metadata && metadata.metaCalls) {
    const registry = new TypeRegistry();
    registry.setMetadata(
      new Metadata(registry, base64Decode(metadata.metaCalls))
    );
    registry.setSignedExtensions(reqPayload.signedExtensions);
    setCallData(reqPayload, registry);
    if (targetNetwork && callData.value) {
      setViewAndProps(targetNetwork);
      setBalanceAndFees(targetNetwork, reqPayload, registry);
    }
  }
  isProcessing.value = false;
});

const setAccount = async (reqAccount: EnkryptAccount) => {
  if (network.value) {
    reqAccount.address = polkadotEncodeAddress(
      reqAccount.address,
      (network.value as SubstrateNetwork).prefix
    );
  }
  account.value = reqAccount;
};

const setCallData = (reqPayload: SignerPayloadJSON, registry: Registry) => {
  const data = registry.createType("Call", reqPayload.method).toHuman();
  callData.value = {
    method: data.method as string,
    section: data.section as string,
    args: data.args,
  };
};

const setViewAndProps = (network: BaseNetwork) => {
  if (network && callData.value) {
    const fullMethod = `${callData.value.section}.${callData.value.method}`;
    const [view, viewProps] = getViewAndProps(
      network as SubstrateNetwork,
      fullMethod,
      callData.value.args
    );
    txViewProps.value = { ...viewProps, ...{ network } };
    txView.value = view;
  }
};

const setBalanceAndFees = (
  network: BaseNetwork,
  payload: SignerPayloadJSON,
  registry: Registry
) => {
  (network.api() as Promise<SubstrateAPI>).then((api) => {
    const extrinsic = registry.createType("Extrinsic", payload, {
      version: payload.version,
    });
    api.api
      .tx(extrinsic)
      .paymentInfo(payload.address, { era: 0 })
      .then((info) => {
        const { partialFee } = info.toJSON();
        txFee.value = new BigNumber(partialFee as string | number);
      });
    api.api.query.system.account(payload.address).then((accountInfo) => {
      const { data } =
        accountInfo.toJSON() as unknown as FrameSystemAccountInfo;
      const balance = {
        balance: new BigNumber(data.free.toString()),
        symbol: network.name,
      };
      userBalance.value = balance;
    });
  });
};

const formatBalance = (balance: BigNumber): string => {
  if (network.value) {
    return balance.div(new BigNumber(10 ** network.value.decimals)).toString();
  }
  return "~";
};

watch([txFee, userBalance], () => {
  if (txFee.value && userBalance.value) {
    if (userBalance.value.balance.lt(txFee.value)) {
      insufficientBalance.value = true;
    }
  }
});

defineExpose({ providerVerifyTransactionScrollRef });

const toggleData = () => {
  isOpenData.value = !isOpenData.value;
};
const approve = async () => {
  isSigning.value = true;
  const { Request, Resolve } = await windowPromise;
  const registry = new TypeRegistry();
  const reqPayload = Request.value.params![0] as SignerPayloadJSON;
  registry.setSignedExtensions(reqPayload.signedExtensions);

  const extType = registry.createType("ExtrinsicPayload", reqPayload, {
    version: reqPayload.version,
  });
  let txActivity: Activity;
  if (network.value) {
    txActivity = {
      from: network.value.displayAddress(account.value!.address),
      to: network.value.displayAddress(account.value!.address),
      isIncoming: false,
      network: network.value.name,
      status: ActivityStatus.pending,
      timestamp: new Date().getTime(),
      token: {
        decimals: network.value.decimals,
        icon: network.value.icon,
        name: network.value.name,
        symbol: network.value.currencyName,
        price: "0",
      },
      type: ActivityType.transaction,
      value: "0x0",
      transactionHash: "",
    };
  }
  const activityState = new ActivityState();
  TransactionSigner({
    account: account.value!,
    network: network.value!,
    payload: extType,
  })
    .then(async (res) => {
      if (network.value) {
        const api = (await network.value.api()).api as ApiPromise;
        const extrinsic = api.createType("Extrinsic", reqPayload, {
          version: reqPayload.version,
        });
        const signed = extrinsic.addSignature(
          account.value!.address,
          JSON.parse(res.result as string),
          reqPayload
        );
        await activityState.addActivities(
          [{ ...txActivity, ...{ transactionHash: u8aToHex(signed.hash) } }],
          {
            address: txActivity.from,
            network: network.value.name,
          }
        );
      }
      Resolve.value(res);
    })
    .catch(async (res) => {
      if (network.value) {
        txActivity.status = ActivityStatus.failed;
        await activityState.addActivities([txActivity], {
          address: txActivity.from,
          network: network.value.name,
        });
      }
      Resolve.value(res);
    })
    .finally(() => (isSigning.value = false));
};
const deny = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "./styles/verify-transaction.less";
</style>
