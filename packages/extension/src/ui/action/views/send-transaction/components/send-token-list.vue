<template>
  <div class="send-token-list" :class="{ show: showTokens }">
    <div class="send-token-list__overlay" @click="close"></div>
    <div class="send-token-list__wrap" :class="{ show: showTokens }">
      <list-search :input="search" placeholder="Search asset" />
      <custom-scrollbar
        class="send-token-list__scroll-area"
        :settings="settings"
      >
        <send-token-item
          v-for="(token, index) in assets"
          :key="index"
          :token="token"
          :select-token="selectToken"
        ></send-token-item>
      </custom-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendTokenList",
};
</script>

<script setup lang="ts">
import { ref, PropType, onMounted, watch } from "vue";
import SendTokenItem from "./send-token-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import ListSearch from "@action/components/list-search/index.vue";
// import { assets } from "@action/types/mock";
import { Token } from "@action/types/token";
import { AssetsType, NodeType } from "@/types/provider";
import type { AccountsHeaderData } from "@action/types/account";

const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};

const assets = ref<AssetsType[]>([]);

const props = defineProps({
  showTokens: Boolean,
  close: {
    type: Function,
    default: () => {
      return null;
    },
  },
  selectToken: {
    type: Function,
    default: () => {
      return null;
    },
  },
  network: {
    type: Object as PropType<NodeType>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const updateAssets = () => {
  if (props.network.assetsHandler) {
    props.network
      .assetsHandler(
        props.network,
        props.accountInfo.selectedAccount?.address || ""
      )
      .then((_assets) => {
        assets.value = _assets;
      });
  }
};
watch([props.network, props.accountInfo], updateAssets);
onMounted(() => {
  updateAssets();
});
const close = () => {
  props.close(false);
};

const search = (text: string) => {
  console.log(text);
};

const selectToken = (token: Token) => {
  props.selectToken(token);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-token-list {
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
    top: 218px;
    background: #ffffff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 103;
    overflow: hidden;
    padding-top: 56px;
    padding: 56px 0 0 16px;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 308px;
  }
}
</style>
