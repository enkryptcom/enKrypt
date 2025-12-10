<template>
  <!-- network list type logic -->
  <div class="network-tab__container">
    <div
      role="tab"
      :aria-selected="activeCategory === NetworksCategory.All"
      :class="[
        'network-tab__container-tab hover-transition-no-bg',
        activeCategory === NetworksCategory.All ? 'active' : '',
      ]"
      @click="setActiveCategory(NetworksCategory.All)"
    >
      All
    </div>
    <div
      role="tab"
      :aria-selected="activeCategory === NetworksCategory.Pinned"
      :class="[
        'network-tab__container-tab hover-transition-no-bg',
        activeCategory === NetworksCategory.Pinned ? 'active' : '',
      ]"
      @click="setActiveCategory(NetworksCategory.Pinned)"
    >
      Pinned
    </div>
    <div
      role="tab"
      :aria-selected="activeCategory === NetworksCategory.New"
      :class="[
        'network-tab__container-tab hover-transition-no-bg',
        activeCategory === NetworksCategory.New ? 'active' : '',
      ]"
      @click="setActiveCategory(NetworksCategory.New)"
    >
      New
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { NetworksCategory } from '@action/types/network-category';
import { trackNetwork } from '@/libs/metrics';
import { NetworkChangeEvents } from '@/libs/metrics/types';

defineProps({
  activeCategory: {
    type: String as PropType<NetworksCategory>,
    required: true,
  },
});
const emit = defineEmits<{
  (e: 'update:category', category: NetworksCategory): void;
}>();
const setActiveCategory = (category: NetworksCategory) => {
  trackNetwork(NetworkChangeEvents.NetworkTabsClicked, {
    networkTab: category,
  });
  emit('update:category', category);
};
</script>

<style lang="less">
@import '@action/styles/theme.less';
.network-tab__container {
  background: @black004;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  border-radius: 10px;
  padding: 4px;
  gap: 1px;
  margin-top: 8px;
  margin-bottom: 4px;

  &-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    width: 100%;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 6px;
    font-size: 14px;
    letter-spacing: 0.25px;
    font-weight: 500;
    text-align: center;

    &.active {
      color: @primary;
      background: @primaryBg;
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.16);
      &:hover {
        background: @primaryBg;
      }
    }
  }
}
</style>
