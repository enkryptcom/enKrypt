<template>
  <a class="best-offer-list-item" @click="(select as ()=>void)">
    <!-- <img :src="require('@/ui/action/icons/raw/paraswap.png')" /> -->
    <div class="best-offer-list-item__info">
      <p>Offer {{ swapNumber }}</p>
      <h5>{{ amount }}</h5>
    </div>

    <Vue3Lottie
      v-show="isLoading"
      class="best-offer-list-item__spiner"
      :animation-data="LottieStatusJson"
    />

    <done-icon v-show="isChecked" class="best-offer-list-item__checked" />
  </a>
</template>

<script setup lang="ts">
import DoneIcon from "@action/icons/common/done_icon.vue";
import LottieStatusJson from "@action/assets/animation/status.json";
import { Vue3Lottie } from "vue3-lottie";

defineProps({
  select: {
    type: Function,
    default: () => {
      return null;
    },
  },
  swapNumber: {
    type: Number,
    default: () => {
      return 0;
    },
  },
  amount: {
    type: String,
    default: () => {
      return "";
    },
  },
  isLoading: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isChecked: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.best-offer-list-item {
  height: 56px;
  width: 100%;
  padding: 8px 12px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  transition: background 300ms ease-in-out;
  border-radius: 8px;

  &:hover,
  &.active {
    background: rgba(0, 0, 0, 0.04);
  }

  img {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }

  &__info {
    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0;
    }

    h5 {
      font-style: normal;
      font-weight: 700;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__spiner {
    width: 24px;
    height: 24px;
    position: absolute;
    top: 50%;
    margin-top: -12px;
    right: 8px;
  }

  &__checked {
    width: 24px;
    height: 24px;
    position: absolute;
    top: 50%;
    margin-top: -12px;
    right: 8px;
  }
}
</style>
