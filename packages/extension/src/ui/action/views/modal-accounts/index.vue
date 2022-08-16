<template>
  <div class="modal-accounts" :class="{ show: showAccounts }">
    <div class="modal-accounts__overlay" @click="close" />
    <div class="modal-accounts__wrap" :class="{ show: showAccounts }">
      <div class="modal-accounts__header">
        <h3>Select account</h3>

        <a class="modal-accounts__close" @click="close()">
          <close-icon />
        </a>
      </div>

      <custom-scrollbar
        class="modal-accounts__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
      >
        <accounts-list-item
          v-for="(account, index) in accountInfo.activeAccounts"
          :key="index"
          :name="account.name"
          :address="network.displayAddress(account.address)"
          :amount="accountInfo.activeBalances[index]"
          :symbol="network.currencyName"
          :is-checked="accountInfo.selectedAccount?.address == account.address"
          :select="selectAccount"
          :active="true"
          :identicon-element="network.identicon"
          :show-edit="showEdit"
        />
      </custom-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import { EnkryptAccount } from "@enkryptcom/types";
import { AccountsHeaderData } from "../../types/account";
import AccountsListItem from "@action/views/accounts/components/accounts-list-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import scrollSettings from "@/libs/utils/scroll-settings";
import { BaseNetwork } from "@/types/base-network";

const emit = defineEmits<{
  (e: "addressChanged", account: EnkryptAccount): void;
}>();

const props = defineProps({
  showAccounts: Boolean,
  close: {
    type: Function,
    default: () => {
      return null;
    },
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: null,
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => null,
  },
  showEdit: Boolean,
});

const close = () => {
  props.close(false);
};

const selectAccount = (address: string) => {
  for (const acc of props.accountInfo.activeAccounts) {
    if (props.network.displayAddress(acc.address) === address) {
      emit("addressChanged", acc);
      break;
    }
  }
  setTimeout(() => {
    props.close();
  }, 100);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.modal-accounts {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 101;
  display: none;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &.show {
    display: flex;
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
    width: 360px;
    height: auto;
    max-height: 504px;
    background: #ffffff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 103;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0s ease-in-out 0.3s;
    overflow: hidden;
    padding-bottom: 8px;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }
  }

  &__header {
    width: 100%;
    background: @white;
    box-sizing: border-box;
    padding: 14px 84px 14px 16px;
    position: relative;
    z-index: 4;

    h3 {
      font-style: normal;
      font-weight: bold;
      font-size: 20px;
      line-height: 28px;
      margin: 0;
      color: @primaryLabel;
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

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 448px;
  }
}
</style>
