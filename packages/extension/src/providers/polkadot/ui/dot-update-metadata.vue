<template>
  <div class="update-metadata">
    <sign-logo
      :color="metadata.color || '#E6007A'"
      class="update-metadata__logo"
    ></sign-logo>
    <h2>Update metadata</h2>
    <div class="update-metadata__block">
      <div class="update-metadata__block-row">
        <div class="update-metadata__block-row-left">From</div>
        <div class="update-metadata__block-row-right">{{ Options.domain }}</div>
      </div>
      <div class="update-metadata__block-row">
        <div class="update-metadata__block-row-left">Chain</div>
        <div class="update-metadata__block-row-right">{{ metadata.chain }}</div>
      </div>
      <div class="update-metadata__block-row">
        <div class="update-metadata__block-row-left">Icon</div>
        <div class="update-metadata__block-row-right">{{ metadata.icon }}</div>
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
    <div class="update-metadata__buttons">
      <div class="update-metadata__buttons-cancel">
        <base-button title="Cancel" :click="deny" :no-background="true" />
      </div>
      <div class="update-metadata__buttons-send">
        <base-button title="Update" :click="approve" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { getCustomError } from "@/libs/error";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { computed, onBeforeMount, ref, watch } from "vue";
import { MetadataDef } from "@polkadot/extension-inject/types";
import MetadataStorage from "@/providers/polkadot/libs/metadata-storage";
import { ProviderRequestOptions, ProviderRPCRequest } from "@/types/provider";

const windowPromise = WindowPromiseHandler(0);

const mstorage = new MetadataStorage();
const currentVersion = ref("unknown");
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
});
const request = ref<ProviderRPCRequest>();

onBeforeMount(async () => {
  const { options, Request } = await windowPromise;
  Options.value = options;
  request.value = Request.value;
});

const metadata = computed(() => {
  if (request.value && request.value.params)
    return request.value.params[0] as MetadataDef;
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

const approve = async () => {
  const { Resolve, Request } = await windowPromise;
  if (
    !Request.value.params ||
    Request.value.params.length < 1 ||
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
.update-metadata {
  width: 100%;
  &__logo {
    margin-bottom: 8px;
  }
  h2 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }
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
  &__account {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
      border-radius: 100%;
    }
    &-info {
      h4 {
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        margin: 0;
      }
      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: @secondaryLabel;
        margin: 0;
        word-break: break-all;
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
  &__buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    &-cancel {
      width: 108px;
    }
    &-send {
      width: 232px;
    }
  }
}
</style>
