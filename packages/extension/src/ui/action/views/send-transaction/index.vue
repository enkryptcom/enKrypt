<template>
  <div class="container">

      <div v-if="!!selected" class="send-transaction">
        <div class="send-transaction__header">
          <h3>Send</h3>
          <a class="send-transaction__close" @click="close">
            <close-icon />
          </a>
        </div>

        <send-address-input
          :input="input"
          :changeFocus="changeFocus"
        ></send-address-input>

        <div class="send-transaction__scroll-content">
          <custom-scrollbar
            class="send-transaction__scroll-area"
            :settings="settings"
            @ps-scroll-y="handleScroll"
          >    
            <send-contacts-list v-if="isFocus"></send-contacts-list>
            <send-token-list v-if="!isFocus && address.length > 0"></send-token-list>
          </custom-scrollbar>
        </div>
      </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendTransaction",
};
</script>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "./components/send-contacts-list.vue";
import SendTokenList from "./components/send-token-list.vue";

const route = useRoute();
const router = useRouter();

let isFocus = ref(false);
let address = ref("");

const selected: number = +route.params.networkId;
const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};

defineProps({});

const close = () => {
  router.go(-1);
};

const input = (text: string) => {
  address.value = text;
};

const changeFocus = (focus: boolean) => {
  isFocus.value = focus;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
}

.send-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;
 
    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 24px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background: @black007;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 468px;
    margin: 0 0 8px 0;
    padding: 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }

  &__scroll-content {
    height: 476px;
  }
}
</style>
