<template>
  <div class="add-network__header">
    <h2>Add network</h2>
  </div>
  <div class="add-network__search">
    <div class="add-network__search-input">
      <Search :is-border="true" />
    </div>
    <div class="add-network__search-add">
      <Button title="Custom network" :click="action" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Search from "@action/components/Search/index.vue";
import Button from "@action/components/Button/index.vue";

export default defineComponent({
  name: "AddNetworkHeader",
  components: {
    Search,
    Button,
  },
  setup() {
    return {
      action: () => {
        console.log("Custom network action");
      },
    };
  },
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.add-network {
  &__header {
    width: 100%;
    height: 68px;
    background: @white;
    box-sizing: border-box;
    padding: 24px 72px 12px 32px;

    h2 {
      font-style: normal;
      font-weight: bold;
      font-size: 24px;
      line-height: 32px;
      margin: 0;
      color: @primaryLabel;
    }
  }

  &__search {
    width: 100%;
    height: 56px;
    background: @white;
    box-sizing: border-box;
    padding: 8px 32px 8px 32px;
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
