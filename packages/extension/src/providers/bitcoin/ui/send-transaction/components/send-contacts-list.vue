<template>
  <div class="send-contacts-list" :class="{ show: showAccounts }">
    <div class="send-contacts-list__overlay" @click="close" />
    <div
      class="send-contacts-list__wrap"
      :class="{ show: showAccounts, header: isMyAddress }"
    >
      <custom-scrollbar
        class="send-contacts-list__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
      >
        <div v-if="!isMyAddress" class="send-contacts-list__block">
          <div class="send-contacts-list__buttons">
            <base-button title="Send to my address" :click="sendToMyAddress" />

            <a
              class="send-contacts-list__buttons-paste"
              @click="pasteFromClipboard"
            >
              <paste-icon /> Paste
            </a>
          </div>
          <h3>Recent</h3>
          <div class="send-contacts-list__list">
            <send-address-item
              v-for="(account, index) in accountInfo.activeAccounts"
              :key="index"
              :account="account"
              :network="network"
              v-bind="$attrs"
              :is-checked="address == account.address"
            />
          </div>
        </div>
        <div v-if="isMyAddress" class="send-contacts-list__block">
          <div class="send-contacts-list__block-header">
            <a class="send-contacts-list__block-back" @click="back()">
              <arrow-back />
            </a>
            <h4>My accounts</h4>
          </div>

          <div class="send-contacts-list__list">
            <send-address-item
              v-for="(account, index) in accountInfo.activeAccounts"
              :key="index"
              :account="account"
              :network="network"
              v-bind="$attrs"
              :is-checked="address == account.address"
            />
          </div>
        </div>
      </custom-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import SendAddressItem from "./send-address-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { AccountsHeaderData } from "@action/types/account";
import scrollSettings from "@/libs/utils/scroll-settings";
import { BaseNetwork } from "@/types/base-network";
import PasteIcon from "@action/icons/actions/paste.vue";
import ArrowBack from "@action/icons/common/arrow-back.vue";

const emit = defineEmits<{
  (e: "update:pasteFromClipboard"): void;
  (e: "close", open: false): void;
}>();

const isMyAddress = ref(false);

defineProps({
  showAccounts: Boolean,
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  address: {
    type: String,
    default: "",
  },
});

const close = () => {
  emit("close", false);
};

const sendToMyAddress = () => {
  isMyAddress.value = true;
};

const back = () => {
  isMyAddress.value = false;
};

const pasteFromClipboard = () => {
  emit("update:pasteFromClipboard");
};
</script>

<style lang="less" scoped>
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
    top: 221px;
    background: #ffffff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 103;
    overflow: hidden;
    padding: 16px 0 8px 0;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }

    &.header {
      padding: 0 0 8px 0;
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
    margin: 24px 0 0 16px;
  }

  &__list {
    padding: 0 8px;
  }

  &__buttons {
    padding: 0 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    a {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 32px;
      letter-spacing: 0.8px;

      &:first-child {
        width: 144px;
        height: 32px;
      }
    }

    &-paste {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px 8px 8px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px !important;
      letter-spacing: 0.8px;
      color: @primaryLabel;
      box-sizing: border-box;
      width: 78px !important;
      cursor: pointer;
      transition: background 300ms ease-in-out;

      &:hover {
        background: @black007;
      }
    }
  }

  &__block {
    &-header {
      width: 100%;
      height: 56px;
      background: @white;
      box-sizing: border-box;
      padding: 14px 56px 14px 56px;
      margin-bottom: 8px;

      h4 {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 28px;
        margin: 0;
        color: @primaryLabel;
        text-align: center;
      }
    }

    &-back {
      position: absolute;
      top: 8px;
      left: 0;
      border-radius: 8px;
      cursor: pointer;
      padding: 8px;
      font-size: 0;
      transition: background 300ms ease-in-out;

      &:hover {
        background: @black007;
      }
    }
  }
}
</style>
