<template>
  <div class="add-network__search">
    <div class="add-network__search-input">
      <base-search :input="searchInput" :is-border="true" />
    </div>
    <div class="add-network__search-add">
      <base-button title="Custom network" :click="action" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "AddNetworkSearch",
};
</script>

<script setup lang="ts">
import BaseSearch from "@action/components/base-search/index.vue";
import BaseButton from "@action/components/base-button/index.vue";

const props = defineProps({
  input: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const searchInput = (text: string) => {
  props.input(text);
};

const action = () => {
  console.log("Custom network action");
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.add-network {
  &__search {
    width: 100%;
    height: 56px;
    background: @white;
    box-sizing: border-box;
    padding: 8px 0 8px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    &-input {
      width: 238px;
      margin-right: 16px;
    }

    &-add {
      width: 142px;
    }
  }
}
</style>
