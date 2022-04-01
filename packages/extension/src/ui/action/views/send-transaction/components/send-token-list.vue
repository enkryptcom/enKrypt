<template>
  <div class="send-token-list">
    <send-token-item
      v-for="(token, index) in assets"
      :key="index"
      :token="token"
    ></send-token-item>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendTokenList",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";
import SendTokenItem from "./send-token-item.vue";
import { assets } from "@action/types/mock";

defineProps({});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-token-list {
  padding: 0 0x 10px 0;
  box-sizing: border-box;
}
</style>
