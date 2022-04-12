<template>
  <div class="add-network__block">
    <div class="add-network__text">
      <img :src="network.image" alt="" />
      <span>{{ network.title }}</span>
    </div>

    <div class="add-network__action">
      <a href="#">
        <InfoIcon />
      </a>
      <Switch :check="check" :is-checked="isActive" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "AddNetworkItem",
};
</script>

<script setup lang="ts">
import { PropType } from "vue";
import { NetworkItem } from "@action/types/network";
import Switch from "@action/components/switch/index.vue";
import InfoIcon from "@action/icons/common/info-icon.vue";

const props = defineProps({
  network: {
    type: Object as PropType<NetworkItem>,
    default: () => {
      return {};
    },
  },
  isActive: Boolean,
});

const check = (isChecked: boolean) => {
  console.log(props.network?.id, isChecked);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.add-network {
  &__block {
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    height: 44px;
  }

  &__text {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    img {
      max-width: 16px;
      margin-right: 8px;
    }

    span {
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
    }
  }

  &__action {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    a {
      display: inline-block;
      font-size: 0;
      margin-right: 10px;
    }
  }
}
</style>
