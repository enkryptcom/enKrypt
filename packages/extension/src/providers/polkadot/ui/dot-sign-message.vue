<template>
  <div class="sign-message">
    <sign-logo color="#E6007A" class="sign-message__logo"></sign-logo>
    <h2>Sign message</h2>

    <div class="sign-message__block">
      <div class="sign-message__account">
        <img :src="identicon" />
        <div class="sign-message__account-info">
          <h4>{{ account.name }}</h4>
          <p>
            {{ $filters.replaceWithEllipsis(account.address, 6, 4) }}
          </p>
        </div>
      </div>
    </div>
    <div class="sign-message__block">
      <div class="sign-message__info">
        <img :src="options.faviconURL" />
        <div class="sign-message__info-info">
          <h4>{{ options.title }}</h4>
          <p>{{ options.domain }}</p>
        </div>
      </div>

      <p class="sign-message__message">
        {{ message }}
      </p>
    </div>
    <div class="sign-message__buttons">
      <div class="sign-message__buttons-cancel">
        <base-button title="Cancel" :click="deny" :no-background="true" />
      </div>
      <div class="sign-message__buttons-send">
        <base-button title="Sign" :click="approve" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { KeyRecord } from "@enkryptcom/types";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { computed } from "vue";
import { utf8ToHex } from "web3-utils";
import { isAscii, u8aToString, u8aUnwrapBytes } from "@polkadot/util";
import networks from "../networks";

const { PromiseResolve, options, Request, sendToBackground } =
  WindowPromiseHandler();
const message = computed(() => {
  if (Request.value.params && Request.value.params.length > 0)
    return isAscii(Request.value.params[0])
      ? u8aToString(u8aUnwrapBytes(Request.value.params[0]))
      : Request.value.params[0];
  return "";
});
const account = computed(() => {
  if (Request.value.params && Request.value.params.length > 1) {
    return Request.value.params[1] as KeyRecord;
  } else return { address: "" } as KeyRecord;
});
const identicon = computed(() => {
  return networks.polkadot.identicon(account.value.address);
});
const approve = () => {
  if (!Request.value.params || Request.value.params.length < 2) {
    return PromiseResolve.value({ error: getCustomError("No params") });
  }
  const msg = Request.value.params[0] as `0x{string}`;
  const bytes = isAscii(msg)
    ? utf8ToHex(u8aToString(u8aUnwrapBytes(msg)))
    : msg;
  const account = Request.value.params[1] as KeyRecord;
  sendToBackground({
    method: InternalMethods.sign,
    params: [bytes, account],
  }).then((res) => {
    if (res.error) {
      PromiseResolve.value(res);
    } else {
      PromiseResolve.value({
        result: JSON.stringify(res.result),
      });
    }
  });
};
const deny = () => {
  PromiseResolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.sign-message {
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
  }
  &__message {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 6px 0;
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
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 6px 0;
    margin-bottom: 6px;
    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
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
