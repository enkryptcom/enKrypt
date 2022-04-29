<template>
  <div class="account">
    <a class="account__info" :class="{ active: active }" @click="showAccounts">
      <img :src="network.identicon(address)" />
      <div class="account__info-name">
        <p>{{ name }}</p>
        <span>{{ $filters.replaceWithEllipsis(address, 6, 4) }}</span>
      </div>
      <switch-arrow />
    </a>
    <div class="account__actions">
      <a class="account__actions--copy" @click="copy(address)">
        <icon-copy />
      </a>
      <a showDeposit class="account__actions--copy" @click="showDeposit">
        <icon-qr />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkHeaderAccount",
};
</script>

<script setup lang="ts">
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import IconQr from "@action/icons/header/qr_icon.vue";
import IconCopy from "@action/icons/header/copy_icon.vue";
import { PropType } from "vue";
import { NodeType } from "@/types/provider";

const props = defineProps({
  name: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  active: Boolean,
  toggleAccounts: {
    type: Function,
    default: () => ({}),
  },
  toggleDeposit: {
    type: Function,
    default: () => ({}),
  },
  network: {
    type: Object as PropType<NodeType>,
    default: () => ({}),
  },
});

const copy = (address: string) => {
  navigator.clipboard.writeText(address);
};
const showAccounts = () => {
  props.toggleAccounts();
};
const showDeposit = () => {
  props.toggleDeposit();
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
.account {
  border-radius: 12px;
  width: 100%;
  height: 56px;
  display: block;
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  position: relative;
  z-index: 104;
  padding: 6px;
  box-sizing: border-box;

  &__info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    width: auto;
    text-decoration: none;
    position: relative;
    box-sizing: border-box;
    padding: 6px;
    padding-right: 32px;
    border-radius: 10px;
    height: 44px;
    cursor: pointer;

    &:hover,
    &.active {
      background: @black007;
    }

    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
      border-radius: 50%;
    }

    &-name {
      p {
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        margin: 0;
      }
      span {
        display: block;
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        color: @secondaryLabel;
        letter-spacing: 0.5px;
      }
    }
    svg {
      position: absolute;
      top: 10px;
      right: 4px;
    }
  }
  &__actions {
    height: 100%;
    width: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    text-decoration: none;
    font-size: 0;
    padding-left: 4px;
    padding-right: 4px;
    box-sizing: border-box;

    a {
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        background: @black007;
      }
    }
  }
}
</style>
