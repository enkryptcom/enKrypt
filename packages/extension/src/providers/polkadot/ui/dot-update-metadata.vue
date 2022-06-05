<template>
  <common-popup>
    <template #header>
      <sign-logo
        :color="metadata.color || '#E6007A'"
        class="common-popup__logo"
      ></sign-logo>
    </template>

    <template #content>
      <h2>Update metadata</h2>
      <div class="update-metadata__block">
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">From</div>
          <div class="update-metadata__block-row-right">
            {{ options.domain }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Chain</div>
          <div class="update-metadata__block-row-right">
            {{ metadata.chain }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Icon</div>
          <div class="update-metadata__block-row-right">
            {{ metadata.icon }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Decimals</div>
          <div class="update-metadata__block-row-right">
            {{ metadata.tokenDecimals }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Symbol</div>
          <div class="update-metadata__block-row-right">
            {{ metadata.tokenSymbol }}
          </div>
        </div>
        <div class="update-metadata__block-row">
          <div class="update-metadata__block-row-left">Upgrade</div>
          <div class="update-metadata__block-row-right">
            {{ currentVersion }} -> {{ metadata.specVersion }}
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
import { computed, ref, watch } from "vue";
import { MetadataDef } from "@polkadot/extension-inject/types";
import MetadataStorage from "@/providers/polkadot/libs/metadata-storage";
const { PromiseResolve, options, Request } = WindowPromiseHandler();
const mstorage = new MetadataStorage();
const currentVersion = ref("unknown");
const metadata = computed(() => {
  if (Request.value.params) return Request.value.params[0] as MetadataDef;
  return {} as MetadataDef;
});
watch(metadata, () => {
  if (metadata.value.genesisHash) {
    mstorage.getMetadata(metadata.value.genesisHash).then((m) => {
      if (m) {
        currentVersion.value = m.specVersion.toString();
      }
    });
  }
});
const approve = () => {
  if (
    !Request.value.params ||
    Request.value.params.length < 1 ||
    !metadata.value.genesisHash
  ) {
    return PromiseResolve.value({ error: getCustomError("No params") });
  }

  mstorage
    .addMetadata(metadata.value.genesisHash, JSON.stringify(metadata.value))
    .then(() => {
      PromiseResolve.value({
        result: JSON.stringify(true),
      });
    });
};
const deny = () => {
  PromiseResolve.value({
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
