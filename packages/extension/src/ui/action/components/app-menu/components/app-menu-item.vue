<template>
  <a class="app-menu__link" :class="{ active: isActive }">
    <img :src="network.icon" alt="" />
    <span>{{ network.name_long }}</span>

    <div class="app-menu__link-drag">
      <drag-icon />
    </div>
  </a>
</template>

<script setup lang="ts">
import { NodeType } from "@/types/provider";
import { PropType } from "vue";
import DragIcon from "@action/icons/common/drag-icon.vue";

defineProps({
  network: {
    type: Object as PropType<NodeType>,
    default: () => {
      return {};
    },
  },
  isActive: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.app-menu {
  &__link {
    text-decoration: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    width: 100%;
    height: 40px;
    margin-bottom: 4px;
    cursor: pointer;
    position: relative;

    &:hover {
      background: @black004;
      border-radius: 10px;

      .app-menu__link-drag {
        display: block !important;
      }
    }

    img {
      width: 24px;
      height: 24px;
      margin: 0 8px;
      border-radius: 50%;
    }

    span {
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
    }

    &.active {
      background: @black007;
      border-radius: 10px;

      span {
        font-weight: 500;
      }
    }

    &-drag {
      position: absolute;
      right: 8px;
      padding: 4px;
      top: 50%;
      margin-top: -12px;
      cursor: grab;
      display: none;
    }
  }
}
</style>
