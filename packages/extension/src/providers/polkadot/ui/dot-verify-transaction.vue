<template>
  <common-popup>
    <template #header>
      <sign-logo color="#E6007A" class="common-popup__logo"></sign-logo>
      <div class="common-popup__network">
        <img
          :src="network ? network.icon : '@/ui/action/icons/raw/polkadot.png'"
        />
        <p>{{ network ? network.name_long : "" }}</p>
      </div>
    </template>

    <template #content>
      <h2>Verify transaction</h2>

      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__account">
          <img
            :src="
              account
                ? createIcon(account.address)
                : '@/ui/action/icons/raw/account.png'
            "
          />
          <div class="provider-verify-transaction__account-info">
            <h4>{{ account?.name }}</h4>
            <div>
              <p v-if="userBalance">
                {{ formatBalance(userBalance.balance) }}
                <span> {{ userBalance.symbol }} </span>
              </p>
              <p v-else>~</p>
              <p>
                {{ $filters.replaceWithEllipsis(account?.address, 4, 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!networkIsUnknown" class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img
            :src="network ? network.icon : '@/ui/action/icons/raw/polkadot.png'"
          />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ network ? network.name_long : "Loading.." }}</h4>
            <p>
              {{ Options.url }}
            </p>
          </div>
        </div>
      </div>

      <component :is="txView" v-bind="txViewProps" />

      <p v-if="!networkIsUnknown">
        Fee: {{ txFee ? `${formatBalance(txFee)}` : "~" }}
      </p>

      <best-offer-error
        v-if="insufficientBalance"
        :not-enought-verify="true"
      ></best-offer-error>

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
      <base-button title="Decline" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Sign" :click="approve" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import { base64Decode } from "@polkadot/util-crypto";
import SignLogo from "@action/icons/common/sign-logo.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import RightChevron from "@action/icons/common/right-chevron.vue";
import BaseButton from "@action/components/base-button/index.vue";
import BestOfferError from "@action/views/swap-best-offer/components/swap-best-offer-block/components/best-offer-error.vue";
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { TypeRegistry, Metadata } from "@polkadot/types";
import { SignerPayloadJSON } from "@polkadot/types/types";
import MetadataStorage from "../libs/metadata-storage";
import { CallData } from "./types";
import { getAllNetworks } from "@/libs/utils/networks";
import { SubstrateNetwork } from "../types/substrate-network";
import { BaseNetwork } from "@/types/base-network";
import BlindVerifyView from "./custom-views/blind-approvetx.vue";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { getViewAndProps } from "./custom-views";
import SubstrateAPI from "../libs/api";
import BigNumber from "bignumber.js";
import { FrameSystemAccountInfo } from "@acala-network/types/interfaces/types-lookup";
import createIcon from "../libs/blockies";
import { ProviderRequestOptions } from "@/types/provider";
import { EnkryptAccount } from "@enkryptcom/types";
import { TransactionSigner } from "./libs/signer";
const windowPromise = WindowPromiseHandler(2);

const providerVerifyTransactionScrollRef = ref(null);
const isOpenData = ref(false);
const callData = ref<CallData>();
const network = ref<BaseNetwork | undefined>();
const networkIsUnknown = ref(false);
const txView = ref<any>(BlindVerifyView);
const account = ref<EnkryptAccount>();
const txFee = ref<BigNumber>();
const userBalance = ref<{ balance: BigNumber; symbol: string }>();
const insufficientBalance = ref(false);
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
});

const metadataStorage = new MetadataStorage();

const txViewProps = ref({});

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  Options.value = options;

  const reqPayload = Request.value.params![0] as SignerPayloadJSON;
  const reqAccount = Request.value.params![1] as EnkryptAccount;
  const targetNetwork = getAllNetworks().find(
    (network) =>
      (network as SubstrateNetwork).genesisHash === reqPayload.genesisHash
  );

  if (targetNetwork) {
    network.value = targetNetwork;
  } else {
    networkIsUnknown.value = true;
  }

  setAccount(reqAccount);
  const metadata = await metadataStorage.getMetadata(reqPayload.genesisHash);

  if (metadata && metadata.metaCalls) {
    setCallData(reqPayload, metadata.metaCalls);

    if (targetNetwork && callData.value) {
      setViewAndProps(targetNetwork);
      setBalanceAndFees(targetNetwork, reqPayload, metadata.metaCalls);
    }
  }
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

const setCallData = (reqPayload: SignerPayloadJSON, metaCalls: string) => {
  const registry = new TypeRegistry();
  registry.setMetadata(new Metadata(registry, base64Decode(metaCalls)));
  registry.setSignedExtensions(reqPayload.signedExtensions);

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

    txViewProps.value = viewProps;
    txView.value = view;
  }
};

const setBalanceAndFees = (
  network: BaseNetwork,
  payload: SignerPayloadJSON,
  metaCalls: string
) => {
  const registry = new TypeRegistry();
  registry.setMetadata(new Metadata(registry, base64Decode(metaCalls)));
  registry.setSignedExtensions(payload.signedExtensions);

  const extrinsic = registry.createType("Extrinsic", payload, {
    version: payload.version,
  });

  (network.api() as Promise<SubstrateAPI>).then((api) => {
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
  const { Request, Resolve } = await windowPromise;
  const registry = new TypeRegistry();
  const reqPayload = Request.value.params![0] as SignerPayloadJSON;
  registry.setSignedExtensions(reqPayload.signedExtensions);
  const extType = registry.createType("ExtrinsicPayload", reqPayload, {
    version: reqPayload.version,
  });
  TransactionSigner({
    account: account.value!,
    network: network.value!,
    payload: extType,
  }).then(Resolve.value);
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
