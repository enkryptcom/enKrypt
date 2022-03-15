<template>
  <div class="container">
    <div v-if="!!selected" class="network-dapps">
      <Item v-for="(item, index) in dapps" :key="index" :app="item"></Item>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Item from "./components/item.vue";

import { dapps } from "../../types/mock";

export default defineComponent({
  name: "NetworkDApps",
  components: {
    Item,
  },
  setup() {
    const route = useRoute();
    const store = useStore();

    return {
      id: computed(() => route.params.id),
      selected: computed(() => store.getters.selected),
      dapps: dapps,
      settings: {
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false,
      },
    };
  },
});
</script>

<style lang="less" scoped>
@import "../../theme/theme.less";
@import "../../theme/custom-scroll.less";

.container {
  width: 100%;
  height: 488px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 56px 0;
  padding-top: 20px;
  box-sizing: border-box;
}

.network-dapps {
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
