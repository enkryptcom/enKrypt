<template>
  <div class="container">
    <custom-scrollbar
      class="network-nfts__scroll-area"
      :settings="settings"
      @ps-scroll-y="handleScroll"
    >
      <div v-if="!!selected" class="network-nfts">
        NetworkNFTs {{ selected.title }}
      </div>
    </custom-scrollbar>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkNFTs",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";
import { useRoute } from "vue-router";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";

const route = useRoute();

defineProps({});

const selected: number = +route.params.id;
const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 488px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 56px 0;
  padding-top: 20px;
  box-sizing: border-box;
}

.network-nfts {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 20px;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 460px;
    margin: 0 0 8px 0;
    padding: 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>
