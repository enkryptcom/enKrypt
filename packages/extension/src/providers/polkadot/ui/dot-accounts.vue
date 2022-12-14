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
      <h2>Connect with Enkrypt</h2>

      <div class="common-popup__block no-inset">
        <div class="common-popup__account">
          <img :src="Options.faviconURL" />
          <div class="common-popup__account-info">
            <h4>{{ Options.domain }}</h4>
          </div>
        </div>
      </div>

      <div class="provider-connect-dapp__link">
        <link-icon />
      </div>

      <div class="common-popup__block no-inset">
        <div class="common-popup__account">
          <img :src="require('@/ui/action/icons/raw/account.png')" />
          <div class="common-popup__account-info">
            <h4>All accounts</h4>
          </div>
        </div>
      </div>

      <div class="provider-connect-dapp__info">
        <info-icon-gray />
        <p>
          This will reveal your all your public addresses, wallet balance and
          activity to
          {{ Options.domain }}
        </p>
      </div>
    </template>

    <template #button-left>
      <base-button title="Decline" :click="decline" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Connect" :click="connect" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import LinkIcon from "@action/icons/connect/link-icon.vue";
import InfoIconGray from "@action/icons/common/info-icon-gray.vue";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { ProviderRequestOptions } from "@/types/provider";
import { getError } from "@/libs/error";
import AccountState from "../libs/accounts-state";
import { SubstrateNetwork } from "../types/substrate-network";
import { ErrorCodes } from "@/providers/ethereum/types";
import { truncate } from "lodash";
import Polkadot from "@/providers/polkadot/networks/polkadot";

const windowPromise = WindowPromiseHandler(0);
const network = ref<SubstrateNetwork>(Polkadot);

const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});

onBeforeMount(async () => {
  const { options } = await windowPromise;
  Options.value = options;
});

const decline = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};

const connect = async () => {
  const { Resolve } = await windowPromise;
  const accountState = new AccountState();
  await accountState.addApprovedDomain(Options.value.domain);
  Resolve.value({
    result: JSON.stringify(truncate),
  });
};
</script>

<style lang="less">
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "~@action/styles/provider-connect-dapp.less";
</style>
