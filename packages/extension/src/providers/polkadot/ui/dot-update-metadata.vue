<template>
  <common-popup>
    <template #header>
      <sign-logo
        :color="metadata ? metadata.color : '#E6007A'"
        class="common-popup__logo"
      ></sign-logo>
      <div class="common-popup__network">
        <img :src="networks.polkadot.icon" />
        <p>{{ metadata ? metadata.chain : networks.polkadot.name_long }}</p>
      </div>
    </template>

    <template #content>
      <h2>Update metadata</h2>

      <div class="update-metadata__block">
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">From</div>
          <div class="update-metadata__block-row-right">
            {{ Options.domain }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Chain</div>
          <div class="update-metadata__block-row-right">
            {{ metadata ? metadata.chain : "" }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Icon</div>
          <div class="update-metadata__block-row-right">
            {{ metadata ? metadata.icon : "" }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Decimals</div>
          <div class="update-metadata__block-row-right">
            {{ metadata ? metadata.tokenDecimals : "" }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Symbol</div>
          <div class="update-metadata__block-row-right">
            {{ metadata ? metadata.tokenSymbol : "" }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Upgrade</div>
          <div class="update-metadata__block-row-right">
            {{ currentVersion }} -> {{ metadata ? metadata.specVersion : "" }}
          </div>
        </div>
      </div>
      <p class="update-metadata__info">
        This approval will add the metadata to your extension instance, allowing
        future request to be decoding using this metadata.
      </p>
    </template>

    <template #button-left>
      <base-button title="Cancel" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Update" :click="approve" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import { getCustomError } from "@/libs/error";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { onBeforeMount, ref, watch } from "vue";
import { MetadataDef } from "@polkadot/extension-inject/types";
import MetadataStorage from "@/providers/polkadot/libs/metadata-storage";
import { ProviderRequestOptions } from "@/types/provider";
import networks from "../networks";

const windowPromise = WindowPromiseHandler(0);

const mstorage = new MetadataStorage();
const currentVersion = ref("unknown");
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});
const metadata = ref<MetadataDef | null>(null);

onBeforeMount(async () => {
  const { options, Request } = await windowPromise;
  Options.value = options;
  metadata.value = Request.value.params![0] as MetadataDef;
  if (metadata.value.genesisHash) {
    mstorage.getMetadata(metadata.value.genesisHash).then((m) => {
      if (m) {
        currentVersion.value = m.specVersion.toString();
      }
    });
  }
});

watch(metadata, () => {
  if (metadata.value && metadata.value.genesisHash) {
    mstorage.getMetadata(metadata.value.genesisHash).then((m) => {
      if (m) {
        currentVersion.value = m.specVersion.toString();
      }
    });
  }
});

const approve = async () => {
  const { Resolve, Request } = await windowPromise;
  if (
    !Request.value.params ||
    Request.value.params.length < 1 ||
    !metadata.value ||
    !metadata.value.genesisHash
  ) {
    return Resolve.value({ error: getCustomError("No params") });
  }

  mstorage
    .addMetadata(metadata.value.genesisHash, JSON.stringify(metadata.value))
    .then(() => {
      Resolve.value({
        result: JSON.stringify(true),
      });
    });
};
const deny = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    result: JSON.stringify(false),
  });
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@/providers/ethereum/ui/styles/common-popup.less";

.update-metadata {
  &__block {
    background: @lightBg;
    border: 1px solid @gray01;
    box-sizing: border-box;
    border-radius: 12px;
    padding: 10px 16px;
    width: 100%;
    margin: 0 0 16px 0;
    &-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-direction: row;
      margin-bottom: 8px;
      &:last-child {
        margin-bottom: 6px;
      }
      &:first-child {
        margin-top: 6px;
      }
      &-left {
        width: 68px;
        margin-right: 16px;
        text-align: right;
        font-style: normal;
        font-weight: 500;
        font-size: 10px;
        line-height: 11px;
        text-align: right;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: @secondaryLabel;
        padding-top: 6px;
      }
      &-right {
        width: 232px;
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
      }
    }
  }
  &__info {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: @secondaryLabel;
    margin: 0 0 16px 0;
    width: 100%;
  }
}
</style>
