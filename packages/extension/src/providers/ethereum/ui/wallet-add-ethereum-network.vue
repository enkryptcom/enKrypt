<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo"></sign-logo>
    </template>

    <template #content>
      <h2>Add EVM Network</h2>

      <div class="provider-verify-transaction__block block-override">
        <div class="provider-verify-transaction__block__add-asset-wrap">
          <div class="provider-verify-transaction__info info-override">
            <img :src="Options.faviconURL" />
            <div class="provider-verify-transaction__info-info">
              <h4>{{ Options.domain }}</h4>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block block-override">
        <div>
          <div class="provider-verify-transaction__block__add-asset-wrap">
            <div
              class="provider-verify-transaction__block__add-asset-wrap__token-info"
            >
              <div
                class="provider-verify-transaction__block__add-asset-wrap__token-info__image"
              >
                <img :src="ethIcon" alt="" />
              </div>
              <div
                class="provider-verify-transaction__block__add-asset-wrap__token-info__info"
              >
                <h5>{{ networkOptions.name_long }}</h5>
                <p>
                  <span>{{ networkOptions.currencyName }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block block-override">
        <div class="provider-verify-transaction__block__add-asset-wrap">
          <div
            class="provider-verify-transaction__block__add-asset-wrap__contract-input"
          >
            <div
              class="provider-verify-transaction__block__add-asset-wrap__contract-input__address"
            >
              <div
                class="provider-verify-transaction__block__add-asset-wrap__contract-input__address-info"
              >
                <p>Chain ID:</p>
                <div>
                  {{ Number(BigInt(networkOptions.chainID)) }} ({{
                    networkOptions.chainID
                  }})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="warning">
        <warn-icon />
        <p>
          Be sure to validate this is the Network you think it is! Double check
          that the chain ID is correct.
        </p>
      </div>
    </template>

    <template #button-left>
      <base-button title="Decline" :click="decline" :no-background="true" />
    </template>

    <template #button-right>
      <base-button
        title="Add Network"
        :disabled="isLoading"
        :click="addNetwork"
      />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import commonPopup from "@action/views/common-popup/index.vue";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { ProviderRequestOptions } from "@/types/provider";
import WarnIcon from "@/ui/action/icons/send/warning-icon.vue";
import { CustomEvmNetworkOptions } from "../types/custom-evm-network";
import CustomNetworksState from "@/libs/custom-networks-state";
import { getCustomError } from "@/libs/error";

const ethIcon = require("../networks/icons/eth.svg");

const windowPromise = WindowPromiseHandler(1);

const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});
const networkOptions = ref<CustomEvmNetworkOptions>({
  name: "~",
  name_long: "~",
  node: "",
  chainID: "0x0",
  currencyName: "~",
  currencyNameLong: "~",
});
const isLoading = ref(true);

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  Options.value = options;
  networkOptions.value = JSON.parse(Request.value.params![0]);
  isLoading.value = false;
});

const decline = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    result: JSON.stringify(false),
  });
};

const addNetwork = async () => {
  const { Resolve } = await windowPromise;
  const customNetworksState = new CustomNetworksState();
  try {
    await customNetworksState.addCustomNetwork(
      JSON.parse(JSON.stringify(networkOptions.value))
    );
  } catch (error) {
    console.error(error);
    Resolve.value({ error: getCustomError((error as Error).message) });
  }
  Resolve.value({ result: JSON.stringify(null) });
};
</script>

<style lang="less">
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "~@action/styles/provider-connect-dapp.less";

.block-override {
  height: 56px !important;
  padding: 0px 16px !important;
}

.info-override {
  padding: 0px !important;
}

.provider-verify-transaction {
  &__block {
    &__add-asset-wrap {
      display: flex;
      align-items: center;
      height: 56px;

      &__contract-input {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
        position: relative;

        &.focus {
          border: 2px solid @primary;
          width: calc(~"100% - 62px");
          margin: 12px 31px 8px 31px;
        }

        &__address {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 100%;

          a {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            border-radius: 8px;
          }

          a:hover {
            background-color: @black007;
          }

          &-info {
            p {
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 16px;
              letter-spacing: 0.5px;
              color: @secondaryLabel;
              margin: 0;
            }

            div {
              width: 100%;
              height: 24px;
              font-style: normal;
              font-weight: 400;
              font-size: 16px;
              line-height: 24px;
              letter-spacing: 0.25px;
              color: @primaryLabel;
              border: 0 none;
              outline: none;
              padding: 0;
            }

            .invalid {
              color: @error;
            }
          }
        }
      }

      &__token-info {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
        position: relative;
        text-decoration: none;

        &__image {
          background: @buttonBg;
          box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
          width: 32px;
          height: 32px;
          border-radius: 100%;
          overflow: hidden;
          margin-right: 12px;

          img {
            width: 100%;
            height: 100%;
          }
        }

        &__info {
          h5 {
            font-style: normal;
            font-weight: 400;
            font-size: 16px;
            line-height: 24px;
            color: @primaryLabel;
            margin: 0 0 1px 0;
          }

          p {
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            letter-spacing: 0.5px;
            color: @secondaryLabel;
            margin: 0;
            width: 128px;

            span {
              font-variant: small-caps;
            }
          }
        }
      }
    }
  }
}

.error {
  background: @error01;
  border-radius: 10px;
  padding: 12px 16px 12px 57px;
  position: relative;
  box-sizing: border-box;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    margin-top: -12px;
  }
  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0;
  }
}

.warning {
  background: @orange01;
  border-radius: 10px;
  padding: 12px 16px 12px 57px;
  position: relative;
  box-sizing: border-box;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    margin-top: -12px;
  }
  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @orange;
    margin: 0;
  }
}
</style>
