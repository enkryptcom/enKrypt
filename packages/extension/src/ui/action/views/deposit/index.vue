<template>
  <div class="deposit" :class="{ show: showDeposit }">
    <div class="deposit__overlay" @click="$emit('toggle:deposit')" />
    <div class="deposit__wrap" :class="{ show: showDeposit }">
      <a class="deposit__close" @click="$emit('toggle:deposit')">
        <close-icon />
      </a>

      <img class="deposit__logo" :src="network.icon" />

      <h2>Your {{ network.name_long }} address</h2>
      <p>
        You can send {{ network.currencyName }} to this address using
        {{ network.name_long }} network.
      </p>

      <div class="deposit__code">
        <qrcode-vue
          :value="
            network.provider + ':' + network.displayAddress(account.address)
          "
          :size="150"
          level="H"
        />
      </div>

      <div class="deposit__account">
        <img
          :src="network.identicon(network.displayAddress(account.address))"
        />

        <div class="deposit__account-info">
          <h4>{{ account.name }}</h4>
          <p>{{ network.displayAddress(account.address) }}</p>
        </div>

        <a
          class="deposit__account-copy"
          @click="copy(network.displayAddress(account.address))"
        >
          <CopyIcon /><span>copy</span>
        </a>

        <notification
          v-if="isCopied"
          :hide="toggleNotification"
          text="Address copied"
          class="deposit__notification"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import CopyIcon from "@action/icons/header/copy_icon.vue";
import { NodeType } from "@/types/provider";
import QrcodeVue from "qrcode.vue";
import { EnkryptAccount } from "@enkryptcom/types";
import Notification from "@action/components/notification/index.vue";

const isCopied = ref(false);

defineProps({
  network: {
    type: Object as PropType<NodeType>,
    default: () => ({}),
  },
  account: {
    type: Object as PropType<EnkryptAccount>,
    default: () => {
      return {};
    },
  },
  showDeposit: {
    type: Boolean,
    default: () => false,
  },
});
defineEmits<{
  (e: "toggle:deposit"): void;
}>();
const copy = (address: string) => {
  navigator.clipboard.writeText(address);
  toggleNotification();
};

const toggleNotification = () => {
  isCopied.value = !isCopied.value;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.deposit {
  width: 800px;
  height: 600px;
  left: -340px;
  top: 0px;
  position: fixed;
  z-index: 105;
  display: none;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  &.show {
    display: flex;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

  &__wrap {
    width: 360px;
    height: 420px;
    background: @white;
    box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    position: relative;
    z-index: 107;
    overflow: hidden;
    padding: 20px;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }

    h2 {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0 0 24px 0;
    }
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__logo {
    display: block;
    height: 32px;
    width: 32px;
    margin-bottom: 4px;
  }

  &__code {
    width: 176px;
    height: 176px;
    background: @white;
    box-shadow: 0px 0.25px 1px rgba(0, 0, 0, 0.039),
      0px 0.85px 3px rgba(0, 0, 0, 0.19);
    border-radius: 16px;
    margin: 0 0 24px 71px;
    padding: 14px;
    box-sizing: border-box;

    img {
      max-width: 148px;
    }
  }

  &__account {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    img {
      max-width: 32px;
      margin-right: 16px;
      border-radius: 100%;
    }

    &-info {
      margin-right: 16px;

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
        max-width: 190px;
        word-break: break-all;
      }
    }

    &-copy {
      padding: 4px 8px 4px 4px;
      box-sizing: border-box;
      height: 24px;
      display: block;
      background: @buttonBg;
      border-radius: 6px;
      text-decoration: none;
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 16px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: @primaryLabel;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      cursor: pointer;
      transition: opacity 300ms ease-in-out;

      &:hover {
        opacity: 0.8;
      }

      svg {
        max-width: 16px;
        margin-right: 4px;
      }
    }
  }

  &__notification {
    position: absolute;
    left: 117px;
    bottom: 16px;
  }
}
</style>
