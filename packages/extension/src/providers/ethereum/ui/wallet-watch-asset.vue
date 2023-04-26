<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo"></sign-logo>
      <div class="common-popup__network">
        <img :src="network.icon" />
        <p>{{ network.name_long }}</p>
      </div>
    </template>

    <template #content>
      <h2>Add token to {{ network.name_long }}</h2>

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
                <p>Contract address:</p>
                <div>
                  {{ $filters.replaceWithEllipsis(tokenInfo.address, 6, 6) }}
                </div>
              </div>
              <tooltip text="View on blockchain explorer"
                ><a
                  class="account__actions--copy"
                  target="_blank"
                  :href="externalLink"
                  ><external-icon /></a
              ></tooltip>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block block-override">
        <div v-if="!tokenNotFound">
          <div class="provider-verify-transaction__block__add-asset-wrap">
            <div
              class="provider-verify-transaction__block__add-asset-wrap__token-info"
            >
              <div
                class="provider-verify-transaction__block__add-asset-wrap__token-info__image"
              >
                <img
                  :src="tokenInfo.icon"
                  alt=""
                  @error="(e) => {
              (e.target as HTMLImageElement).src = network.icon
            }"
                />
              </div>
              <div
                class="provider-verify-transaction__block__add-asset-wrap__token-info__info"
              >
                <h5 v-if="tokenInfo.name.length <= 16">{{ tokenInfo.name }}</h5>
                <tooltip v-else :text="tokenInfo.name">
                  <h5>{{ `${tokenInfo.name.slice(0, 12)}...` }}</h5>
                </tooltip>
                <p>
                  {{ userBalance }}
                  <span>{{ tokenInfo.symbol }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="tokenNotFound">
        <div class="error">
          <alert-icon />
          <p>
            There is no ERC20 token deployed at this address. Make sure you have
            the right contract address and you are connected to the correct
            network.
          </p>
        </div>
      </div>
      <div v-else class="warning">
        <warn-icon />
        <p>
          Be sure to validate this is the ERC20 token you think it is! Anyone
          can create a token, even one pretending to be a popular token.
        </p>
      </div>
    </template>

    <template #button-left>
      <base-button title="Decline" :click="decline" :no-background="true" />
    </template>

    <template #button-right>
      <base-button
        title="Add token"
        :disabled="tokenNotFound"
        :click="addToken"
      />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, toRaw } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import commonPopup from "@action/views/common-popup/index.vue";
import { DEFAULT_EVM_NETWORK, getNetworkByName } from "@/libs/utils/networks";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { EvmNetwork } from "../types/evm-network";
import { ProviderRequestOptions } from "@/types/provider";
import AlertIcon from "@/ui/action/icons/send/alert-icon.vue";
import WarnIcon from "@/ui/action/icons/send/warning-icon.vue";
import { CustomErc20Token, TokenType } from "@/libs/tokens-state/types";
import ExternalIcon from "@action/icons/header/external-icon.vue";
import Tooltip from "@action/components/tooltip/index.vue";
import { fromBase } from "@enkryptcom/utils";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import { TokensState } from "@/libs/tokens-state";

const windowPromise = WindowPromiseHandler(4);
const network = ref<EvmNetwork>(DEFAULT_EVM_NETWORK);
const tokenNotFound = ref(false);
const tokenInfo = ref<CustomErc20Token>({
  type: TokenType.ERC20,
  name: "Unknown",
  symbol: "UNKNWN",
  decimals: 18,
  icon: network.value.icon,
  address: "0x000000000000000000000000",
});
const userBalance = ref<string>("");

const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});

const externalLink = computed(() => {
  return network.value.blockExplorerAddr.replace(
    "[[address]]",
    tokenInfo.value.address
  );
});

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  Options.value = options;
  tokenInfo.value = Request.value.params![0];
  network.value = (await getNetworkByName(
    Request.value.params![3]
  )) as EvmNetwork;
  const balance = Request.value.params![1];

  if (balance !== "") {
    userBalance.value = formatFloatingPointValue(
      fromBase(balance, tokenInfo.value.decimals)
    ).value;
  }
});

const decline = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    result: JSON.stringify(false),
  });
};

const addToken = async () => {
  const { Resolve } = await windowPromise;
  const tokensState = new TokensState();

  const added = await tokensState.addErc20Token(
    network.value.name,
    toRaw(tokenInfo.value)
  );

  if (added) {
    Resolve.value({ result: JSON.stringify(true) });
  }

  Resolve.value({ result: JSON.stringify(false) });
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
