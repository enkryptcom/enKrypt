<template>
  <div class="sign-message">
    <sign-logo color="#E6007A" class="sign-message__logo"></sign-logo>
    <h2>Sign message</h2>

    <div class="sign-message__block">
      <div class="sign-message__account">
        <img :src="networks.polkadot.identicon(account.address)" />
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
        <img :src="Options.faviconURL" />
        <div class="sign-message__info-info">
          <h4>{{ Options.title }}</h4>
          <p>{{ Options.domain }}</p>
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
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { onBeforeMount, ref } from "vue";
import { utf8ToHex } from "web3-utils";
import { isAscii, u8aToString, u8aUnwrapBytes } from "@polkadot/util";
import networks from "../networks";
import { ProviderRequestOptions } from "@/types/provider";

const windowPromise = WindowPromiseHandler(0);

const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
});
const message = ref("");
const account = ref({ address: "" } as KeyRecord);

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  Options.value = options;

  message.value = isAscii(Request.value.params![0])
    ? u8aToString(u8aUnwrapBytes(Request.value.params![0]))
    : Request.value.params![0];

  account.value = Request.value.params![1] as KeyRecord;
});

const approve = async () => {
  const { Request, Resolve, sendToBackground } = await windowPromise;

  const msg = Request.value.params![0] as `0x{string}`;
  const bytes = isAscii(msg)
    ? utf8ToHex(u8aToString(u8aUnwrapBytes(msg)))
    : msg;
  const account = Request.value.params![1] as KeyRecord;
  sendToBackground({
    method: InternalMethods.sign,
    params: [bytes, account],
  }).then((res) => {
    if (res.error) {
      Resolve.value(res);
    } else {
      Resolve.value({
        result: JSON.stringify(res.result),
      });
    }
  });
};
const deny = async () => {
  const { Resolve } = await windowPromise;

  Resolve.value({
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
