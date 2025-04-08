<template>
  <app-dialog v-model="model" @close:dialog="close">
    <div class="network-select-list">
      <div class="network-select-list__header">
        <h3>Select to Network</h3>
      </div>

      <custom-scrollbar
        class="network-select-list__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
      >
        <network-select-list-item
          v-for="(item, index) in assets"
          :key="index"
          :token="item"
          v-bind="$attrs"
        />
      </custom-scrollbar>
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import NetworkSelectListItem from './network-select-list-item.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import scrollSettings from '@/libs/utils/scroll-settings';
import { PropType } from 'vue';
import { NetworkInfo } from '@enkryptcom/swap';
import AppDialog from '@action/components/app-dialog/index.vue';

const emit = defineEmits<{
  (e: 'close', close: boolean): void;
}>();

defineProps({
  assets: {
    type: Array as PropType<NetworkInfo[]>,
    default: () => [],
  },
});

const close = () => {
  emit('close', false);
};

const model = defineModel<boolean>();
</script>

<style lang="less">
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.network-select-list {
  &__header {
    position: relative;
    padding: 14px 56px 14px 16px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 455px;
    margin: 0 0 8px 0;
    padding: 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }

    .ps__rail-y {
      right: 4px !important;
    }
  }
}
</style>
