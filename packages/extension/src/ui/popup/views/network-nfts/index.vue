<template>
  <div class="container">
    <div v-if="!!selected" class="network-nfts">
      NetworkNFTs {{ selected.title }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  name: "NetworkNFTs",
  components: {},
  setup() {
    const route = useRoute();
    const store = useStore();

    return {
      id: computed(() => route.params.id),
      selected: computed(() => store.getters.selected),
    };
  },
});
</script>

<style lang="less" scoped>
@import "../../styles/theme.less";
@import "../../styles/custom-scroll.less";

.container {
  width: 100%;
  height: 488px;
  overflow-x: hidden;
  overflow-y: scroll;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 56px 0;
}

.network-nfts {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>
