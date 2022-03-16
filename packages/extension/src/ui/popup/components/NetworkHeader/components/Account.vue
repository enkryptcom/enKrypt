<template>
  <div class="account">
    <a class="account__info" :class="{ active: active }" @click="showAccounts">
      <img :src="getImgUrl(address)" />
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
import { defineComponent } from "vue";
import SwitchArrow from "../../../icons/header/switch_arrow.vue";
import IconQr from "../../../icons/header/qr_icon.vue";
import IconCopy from "../../../icons/header/copy_icon.vue";

export default defineComponent({
  name: "Account",
  components: {
    IconQr,
    SwitchArrow,
    IconCopy,
  },
  props: {
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
  },
  methods: {
    getImgUrl: function (address: string) {
      return "https://mewcard.mewapi.io/?address=" + address;
    },
    copy: function (address: string) {
      navigator.clipboard.writeText(address);
    },
    showAccounts: function () {
      this.$props.toggleAccounts();
    },
    showDeposit: function () {
      this.$props.toggleDeposit();
    },
  },
});
</script>

<style lang="less">
@import "../../../styles/theme.less";
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
      height: 24px;
      margin-right: 12px;
      border-radius: 5px;
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
