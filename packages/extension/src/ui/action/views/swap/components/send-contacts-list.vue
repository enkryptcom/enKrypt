<template>
  <div class="send-contacts-list" :class="{ show: showAccounts }">
    <div class="send-contacts-list__overlay" @click="close" />
    <div class="send-contacts-list__wrap" :class="{ show: showAccounts }">
      <custom-scrollbar
        class="send-contacts-list__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
      >
        <div class="send-contacts-list__buttons">
          <base-button title="Send to my address" :click="sendToMyAddress" />
          <base-button
            title="Paste from clipboard"
            :click="pasteFromClipboard"
          />
        </div>
        <h3>My Accounts</h3>
        <send-address-item
          v-for="(account, index) in accounts"
          :key="index"
          :account="account"
          v-bind="$attrs"
        />
      </custom-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import SendAddressItem from "./send-address-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import BaseButton from "@action/components/base-button/index.vue";
import scrollSettings from "@/libs/utils/scroll-settings";
import { EnkryptAccount } from "@enkryptcom/types";

const emit = defineEmits<{
  (e: "update:pasteFromClipboard"): void;
  (e: "close", open: false): void;
}>();

defineProps({
  showAccounts: Boolean,
  accounts: {
    type: Object as PropType<EnkryptAccount[]>,
    default: () => ({}),
  },
});

const close = () => {
  emit("close", false);
};

const sendToMyAddress = () => {
  console.log("sendToMyAddress");
};

const pasteFromClipboard = () => {
  emit("update:pasteFromClipboard");
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-contacts-list {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 101;
  display: none;

  &.show {
    display: block;
  }

  &__overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 102;
  }

  &__wrap {
    position: absolute;
    width: 396px;
    height: auto;
    max-height: 530px;
    left: 32px;
    top: 146px;
    background: #ffffff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 103;
    overflow: hidden;
    padding: 0 16px 0 16px;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 380px;
  }

  h3 {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: @secondaryLabel;
    margin: 24px 0 0 0;
  }

  &__buttons {
    padding-top: 16px;

    a {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 32px;
      letter-spacing: 0.8px;

      &:first-child {
        width: 144px;
        height: 32px;
        margin-right: 8px;
      }

      &:last-child {
        width: 152px;
        height: 32px;
      }
    }
  }
}
</style>
