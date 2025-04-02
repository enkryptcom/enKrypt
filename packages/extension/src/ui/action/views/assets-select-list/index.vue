<template>
  <app-dialog v-model="model" @close:dialog="close">
    <div class="assets-select-list">
      <div class="assets-select-list__header">
        <h3 v-if="!isSelectToToken && !isSend">Select token to swap</h3>
        <h3 v-if="isSelectToToken">Select token to receive</h3>
        <h3 v-if="isSend">Select asset to send</h3>
      </div>
      <assets-select-list-search v-model="searchQuery" />

      <custom-scrollbar
        class="assets-select-list__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
        @ps-y-reach-end="yEnd"
      >
        <div v-show="isSelectToToken" class="assets-select-list__fast-tokens">
          <swap-token-fast-list v-bind="$attrs" />
        </div>
        <assets-select-list-item
          v-for="(item, index) in listedAssets"
          :key="index"
          :token="item"
          v-bind="$attrs"
        />

        <assets-select-loading
          v-if="listedAssets.length === 0"
          :is-empty="listedAssets.length === 0"
          :is-loading="isLoading"
        />
      </custom-scrollbar>
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import AssetsSelectListItem from './components/assets-select-list-item.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import AssetsSelectListSearch from './components/assets-select-list-search.vue';
import SwapTokenFastList from '@action/views/swap/components/swap-token-fast-list/index.vue';
import scrollSettings from '@/libs/utils/scroll-settings';
import { computed, PropType, ref } from 'vue';
import AssetsSelectLoading from './components/assets-select-loading.vue';
import { BaseToken } from '@/types/base-token';
import { throttle } from 'lodash';
import AppDialog from '@action/components/app-dialog/index.vue';

const emit = defineEmits<{
  (e: 'close', close: boolean): void;
}>();

const props = defineProps({
  isSelectToToken: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isSend: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  assets: {
    type: Array as PropType<BaseToken[]>,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});

const refInitialAmount = ref(50);

const yEnd = throttle(event => {
  if (
    props.assets.length > refInitialAmount.value &&
    event.srcElement.classList.contains('ps--active-y')
  ) {
    refInitialAmount.value = refInitialAmount.value + 25;
  }
}, 500);

const searchQuery = ref<string>();

const listedAssets = computed(() => {
  if (searchQuery.value) {
    return props.assets
      .filter(token => {
        const tokenNameLowerCase = token.name.toLowerCase();
        const tokenSymbolLowerCase = token.symbol.toLowerCase();
        const tokenAddressLowerCase = (token as any).contract
          ? (token as any).contract.toLowerCase()
          : '';
        const searchQueryLowerCase = searchQuery.value!.toLowerCase();

        if (
          tokenNameLowerCase.startsWith(searchQueryLowerCase) ||
          tokenSymbolLowerCase.startsWith(searchQueryLowerCase) ||
          tokenAddressLowerCase.startsWith(searchQueryLowerCase)
        ) {
          return true;
        }

        return false;
      })
      .slice(0, refInitialAmount.value);
  } else {
    return props.assets.slice(0, refInitialAmount.value);
  }
});

const close = () => {
  emit('close', false);
};

/** -------------------
 * Dialog
 * ------------------- */
const model = defineModel<boolean>();
</script>

<style lang="less">
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.assets-select-list {
  width: 100%;
  height: 568px;

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

  &__fast-tokens {
    padding-top: 12px;

    .swap-token-fast-list__all {
      display: none;
    }
  }

  &__search-more-tokens {
    margin: auto;
    padding: 16px;
    text-align: center;
    font-size: 16px;
    font-weight: 400;
    color: @secondaryLabel;
  }
}
</style>
