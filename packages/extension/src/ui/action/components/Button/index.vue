<template>
  <a class="button">{{ title }}</a>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Button",
  components: {},
  props: {
    title: {
      type: String,
      default: "",
    },
    click: {
      type: Function,
      default: () => ({}),
    },
  },
});
</script>

<style lang="less">
@import "~@popup/styles/theme.less";

.button {
  background: @primary;
  box-shadow: 0px 0.25px 1px rgba(0, 0, 0, 0.039),
    0px 0.85px 3px rgba(0, 0, 0, 0.19);
  border-radius: 10px;
  display: inline-block;
  width: 100%;
  height: 40px;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 40px;
  letter-spacing: 0.5px;
  color: @white;
  text-align: center;
  cursor: pointer;
}
</style>
