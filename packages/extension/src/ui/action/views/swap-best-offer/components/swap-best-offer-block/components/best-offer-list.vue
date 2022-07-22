<template>
  <div class="best-offer-list">
    <best-offer-list-item
      name="Paraswap"
      amount="~129.634 COMP"
      :select="select"
      :is-checked="true"
    ></best-offer-list-item>
    <best-offer-list-item
      name="Changelly"
      amount="~129.56 COMP"
      :select="select"
      :is-loading="true"
    ></best-offer-list-item>
    <best-offer-list-item
      name="Bity"
      amount="~129.55 COMP"
      :select="select"
    ></best-offer-list-item>
  </div>
</template>

<script setup lang="ts">
import BestOfferListItem from "./best-offer-list-item.vue";

const props = defineProps({
  select: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const select = () => {
  props.select();
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.best-offer-list {
  background: #ffffff;
  box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
    0px 3.75px 11px rgba(0, 0, 0, 0.19);
  border-radius: 12px;
  box-sizing: border-box;
  width: 256px;
  padding: 4px;
  position: absolute;
  left: -6px;
  top: 37px;
  z-index: 10;
}
</style>
