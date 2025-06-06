<template>
  <div class="base-select__container">
    <a class="base-select" @click="open">
      <div class="base-select__img-container">
        <img :src="selectedIcon" width="40" height="40" />
      </div>
      <div>
        <p>{{ title }}</p>
        <h5>{{ value }}</h5>
      </div>

      <div class="base-select__arrow">
        <switch-arrow />
      </div>
    </a>
    <div v-show="isOpen" class="base-select__dropdown">
      <base-search
        :value="searchInput"
        :is-border="true"
        @update:value="updateSearchValue"
      />
      <div class="base-select__dropdown__item-container">
        <setting-select-option
          v-for="(item, index) in searchedList"
          :key="index"
          :title="item.fiat_currency as string"
          :select="selectLanguage"
          :is-select="value == item.fiat_currency"
          :flag="item.img"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import SettingSelectOption from './setting-select-option.vue';
import BaseSearch from '@/ui/action/components/base-search/index.vue';

const isOpen = ref(false);
const searchInput = ref('');

const props = defineProps({
  select: {
    type: Function,
    default: () => {
      return null;
    },
  },
  title: {
    type: String,
    default: () => {
      return '';
    },
  },
  value: {
    type: String,
    default: () => {
      return '';
    },
  },
  list: {
    type: Array,
    default: () => {
      return [];
    },
  },
});

const searchedList = computed(() => {
  if (!searchInput.value) return props.list;
  const filtered = props.list.filter(item =>
    item.fiat_currency.includes(searchInput.value.toUpperCase()),
  );
  return filtered;
});

const selectedIcon = computed(() => {
  const selected = props.list.find(item => item.fiat_currency === props.value);
  return selected ? selected.img : '';
});

const open = () => {
  isOpen.value = !isOpen.value;
};

const selectLanguage = (value: string) => {
  props.select(value);
  isOpen.value = !isOpen.value;
};

const updateSearchValue = (newval: string) => {
  searchInput.value = newval;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.base-select {
  height: 56px;
  background: #ffffff;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: 100%;
  padding: 8px 16px;
  display: flex;
  position: relative;
  cursor: pointer;
  text-decoration: none;

  &__img-container {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 16px;

    img {
      width: 60px;
      height: 60px;
      margin-top: -10px;
      margin-left: -10px;
    }
  }

  h5 {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @primaryLabel;
    width: 290px;
    margin: 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;
    margin: 0;
    width: 290px;

    span {
      font-variant: small-caps;
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 4px;
    right: 8px;
    top: 50%;
    margin-top: -16px;
  }

  &__container {
    position: relative;
    margin: 0 32px 16px 32px;
  }

  &__dropdown {
    background: @white;
    box-shadow:
      0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    padding: 8px;
    position: absolute;
    width: 100%;
    left: 0;
    top: 58px;
    box-sizing: border-box;
    z-index: 1;

    &__item-container {
      max-height: 230px;
      overflow: scroll;
    }
  }
}
</style>
