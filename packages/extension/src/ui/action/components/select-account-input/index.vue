<template>
  <div class="select-account-input">
    <a
      class="select-account-input__info"
      @click="$emit('toggle:selectAccounts')"
    >
      <img :src="identicon" />
      <div class="select-account-input__info-name">
        <p>{{ name }}</p>
        <span>{{ $filters.replaceWithEllipsis(address, 6, 4) }}</span>
      </div>
      <switch-arrow />
    </a>
  </div>
</template>

<script setup lang="ts">
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
defineEmits<{
  (e: "toggle:selectAccounts"): void;
}>();
defineProps({
  name: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  identicon: {
    type: String,
    default: "",
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";
.select-account-input {
  width: 100%;
  height: 56px;
  display: block;
  text-decoration: none;
  position: relative;
  box-sizing: border-box;
  padding: 10px 16px;

  &__info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    width: auto;
    text-decoration: none;
    position: relative;
    cursor: pointer;
    width: 100%;

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
      top: 50%;
      right: 0;
      margin-top: -12px;
    }
  }
}
</style>
