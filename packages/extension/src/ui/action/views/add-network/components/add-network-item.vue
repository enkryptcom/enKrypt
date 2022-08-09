<template>
  <div class="add-network__block">
    <div class="add-network__text">
      <img :src="network.icon" alt="" />
      <span>{{ network.name_long }}</span>
    </div>

    <div class="add-network__action">
      <!-- <a href="#">
        <InfoIcon />
      </a> -->
      <Switch :is-checked="isActive" @update:check="check" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import Switch from "@action/components/switch/index.vue";
// import InfoIcon from "@action/icons/common/info-icon.vue";
import { NodeType } from "@/types/provider";

const emit = defineEmits<{
  (e: "networkToggled", name: string, isActive: boolean): void;
}>();

const props = defineProps({
  network: {
    type: Object as PropType<NodeType>,
    default: () => {
      return {};
    },
  },
  isActive: Boolean,
});

const check = async (isChecked: boolean) => {
  emit("networkToggled", props.network.name, isChecked);
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
      width: 16px;
      height: 16px;
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
