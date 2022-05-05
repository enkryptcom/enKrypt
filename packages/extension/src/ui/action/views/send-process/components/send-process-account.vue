<template>
  <div class="send-process-account">
    <img
      v-if="avatar"
      :src="avatar"
      class="send-process-account__img avatar"
      alt=""
    />
    <img
      v-else
      :src="getImgUrl(address)"
      class="send-process-account__img avatar"
      alt=""
    />

    <div class="send-process-account__name">
      <p>To</p>
      <h4>{{ name ? name : address }}</h4>
      <h6 v-show="!!name">{{ $filters.replaceWithEllipsis(address, 6, 4) }}</h6>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendProcessAccount",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";

defineProps({
  address: {
    type: String,
    default: () => {
      return "";
    },
  },
  name: {
    type: String,
    default: () => {
      return null;
    },
  },
  avatar: {
    type: String,
    default: () => {
      return null;
    },
  },
});

const getImgUrl = (address: string) => {
  return "https://mewcard.mewapi.io/?address=" + address;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-process-account {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;

  &__img {
    width: 32px;
    height: 24px;
    margin-right: 12px;
    border-radius: 5px;

    &.avatar {
      height: 32px;
      border-radius: 100%;
    }
  }

  &__name {
    h4 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 0;
      word-break: break-all;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 0;
    }

    h6 {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 0;
    }
  }
}
</style>
