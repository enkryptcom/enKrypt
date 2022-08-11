<template>
  <div class="assets-select-list-search">
    <search-icon class="assets-select-list-search__icon"></search-icon>
    <input
      ref="searchInput"
      type="text"
      placeholder="Search tokens by name, ticker, or address"
      autocomplete="off"
      @input="searchUpdate"
    />
    <a
      v-show="!isSend"
      ref="filterButton"
      class="assets-select-list-search__filter"
      @click="toggleFilter"
    >
      <filter-icon />
    </a>

    <div
      v-show="openList"
      ref="dropdown"
      class="assets-select-list-search__list"
    >
      <a
        class="assets-select-list-search__list-item"
        @click="() => networkUpdate('all')"
        >All networks
        <done-icon
          v-show="selectedNetwork === 'all'"
          class="assets-select-list-search__list-item-checked"
        ></done-icon
      ></a>
      <a
        v-for="network in networks"
        :key="network"
        class="assets-select-list-search__list-item"
        @click="() => networkUpdate(network)"
      >
        {{ `${network[0].toUpperCase()}${network.slice(1)}` }}
        <done-icon
          v-show="network === selectedNetwork"
          class="assets-select-list-search__list-item-checked"
        ></done-icon>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchIcon from "@action/icons/common/search.vue";
import FilterIcon from "@action/icons/common/filter-icon.vue";
import { PropType, ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import DoneIcon from "@action/icons/common/done_icon.vue";

const emit = defineEmits<{
  (e: "update:tokenSearchInput", searchQuery: string): void;
  (e: "update:selectedNetwork", network: string): void;
}>();

defineProps({
  isSend: { type: Boolean, default: () => false },
  networks: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  selectedNetwork: {
    type: String,
    default: () => "",
  },
});

const searchInput = ref<HTMLInputElement>();

const openList = ref(false);
const dropdown = ref(null);
const filterButton = ref(null);

const searchUpdate = () => {
  if (searchInput.value) {
    emit("update:tokenSearchInput", searchInput.value.value);
  }
};

const networkUpdate = (network: string) => {
  toggleFilter();
  emit("update:selectedNetwork", network);
};

const toggleFilter = () => {
  console.log("clicked", openList.value);
  openList.value = !openList.value;
};

onClickOutside(
  dropdown,
  () => {
    if (openList.value) openList.value = false;
  },
  { ignore: [filterButton] }
);
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.assets-select-list-search {
  width: 100%;
  height: 56px;
  background: @primaryBg;
  position: relative;
  box-sizing: border-box;
  padding: 17px 20px 17px 56px;
  border-bottom: 1px solid @gray02;

  &__icon {
    position: absolute;
    left: 16px;
    top: 16px;
  }

  input {
    width: 100%;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    border: 0 none;
    outline: none;
  }

  &__filter {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;
    padding: 8px;

    &:hover {
      background: @black007;
    }
  }

  &__list {
    width: 256px;
    height: fit-content;
    background: @white;
    box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
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
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      padding-left: 12px;
      box-sizing: border-box;
      position: relative;

      &:hover,
      &.active {
        background: rgba(0, 0, 0, 0.04);
      }

      &-checked {
        position: absolute;
        right: 12px;
        top: 12px;
      }
    }
  }
}
</style>
