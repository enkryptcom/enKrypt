<template>
  <div class="send-contacts-list">
    <h3>Recent</h3>
    <send-address-item
      v-for="(account, index) in accountsActive"
      :key="index"
      :account="account"
    ></send-address-item>
    <h3>All Contacts</h3>
    <send-address-item
      v-for="(account, index) in accountsInActive"
      :key="index"
      :account="account"
    ></send-address-item>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendContactsList",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";
import SendAddressItem from "./send-address-item.vue";
import { accountsActive, accountsInActive } from "@action/types/mock";

defineProps({});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-contacts-list {
  padding: 0 32px 10px 32px;
  box-sizing: border-box;

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
}
</style>
