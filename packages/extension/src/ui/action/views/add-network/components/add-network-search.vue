<template>
  <div class="add-network__search">
    <div class="add-network__search-input">
      <base-search v-bind="$attrs" :is-border="true" :value="value" />
    </div>
    <div ref="tooltip" class="add-network__search-wrap">
      <div class="add-network__search-add">
        <a
          @click="$emit('action:customNetwork')"
          aria-label="Add Custom Network"
        >
          <plus-icon />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseSearch from '@action/components/base-search/index.vue';
import PlusIcon from '@action/icons/common/plus-icon.vue';
import { onClickOutside } from '@vueuse/core';

const openList = ref(false);
const tooltip = ref(null);
defineProps({
  value: {
    type: String,
    default: () => {
      return '';
    },
  },
});
defineEmits<{
  (e: 'action:customNetwork'): void;
}>();

onClickOutside(tooltip, () => {
  if (openList.value) openList.value = false;
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

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
    position: relative;

    &-input {
      width: 348px;
      margin-right: 8px;
    }

    &-add {
      font-size: 0;
      border-radius: 12px;
      transition: background 300ms ease-in-out;
      padding: 8px;
      cursor: pointer;
      &:hover {
        background: @black007;
      }
    }

    &-list {
      width: 256px;
      height: fit-content;
      background: @white;
      box-shadow:
        0px 0.5px 5px rgba(0, 0, 0, 0.039),
        0px 3.75px 11px rgba(0, 0, 0, 0.19);
      border-radius: 12px;
      position: absolute;
      top: 52px;
      right: 0;
      z-index: 4;
      padding: 8px;
      box-sizing: border-box;

      &-item {
        width: 100%;
        height: 48px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
        cursor: pointer;
        transition: background 300ms ease-in-out;
        border-radius: 8px;

        &:hover,
        &.active {
          background: rgba(0, 0, 0, 0.04);
        }

        svg {
          margin-right: 12px;
          margin-left: 12px;
        }

        span {
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.25px;
          color: @primaryLabel;
        }

        .switch {
          margin-left: 52px;
        }
      }
    }
  }
}
</style>
