<template>
  <div class="app__menu__sort">
    <a
      ref="toggleSortButton"
      class="app__menu__sort__button hover-transition-no-bg"
      @click="toggleSortMenu"
    >
      sort: {{ sortBy.name }} {{ sortBy.direction }}
    </a>
    <div
      v-show="isOpenSort"
      ref="dropdownSort"
      class="app__menu__sort__dropdown"
    >
      <a
        class="app__menu-dropdown-link"
        @click="setActiveSort(NetworkSortOption.Name)"
      >
        Name
      </a>
      <a
        class="app__menu-dropdown-link"
        @click="setActiveSort(NetworkSortOption.Name)"
      >
        Total value Locked
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { NetworkSort, NetworkSortOption } from '@action/types/network-sort';

const props = defineProps({
  sortBy: {
    type: String as PropType<NetworkSort>,
    required: true,
  },
});
const emit = defineEmits<{
  (e: 'update:sort', sortBy: NetworkSort): void;
}>();

const setActiveSort = (_sort: NetworkSortOption) => {
  const newSortBy = props.sortBy;
  if (_sort === props.sortBy.name) {
    newSortBy.direction = !newSortBy.direction;
  }
  emit('update:sort', newSortBy);
};

const isOpenSort = ref(false);
let timeout: ReturnType<typeof setTimeout> | null = null;

const dropdownSort = ref(null);
const toggleSortButton = ref(null);

const sortString = (sort: NetworkSort) => {
  switch (sort.name) {
    case NetworkSortOption.Name:
      return 'Name';
    case NetworkSortOption.TotalValueLocked:
      return 'Total value Locked';
    default:
      return `${sort.name} ${sort.direction}`;
  }
};

/** -------------------
 * Menu Actions
 * ------------------- */

const toggleSortMenu = () => {
  if (timeout != null) {
    clearTimeout(timeout);

    timeout = null;
  }
  if (isOpenSort.value) {
    closeSortMenu();
  } else {
    isOpenSort.value = true;
  }
};
const closeSortMenu = () => {
  if (timeout != null) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    isOpenSort.value = false;
  }, 50);
};
onClickOutside(
  dropdownSort,
  () => {
    closeSortMenu();
  },
  { ignore: [toggleSortButton] },
);
</script>

<style lang="less">
@import '@action/styles/theme.less';

.app {
  &__menu {
    &__sort {
      display: flex;
      height: 24px;
      position: relative;
      &__button {
        padding: 4px 8px;
        margin-left: auto;
        position: relative;
        font-size: 11px;
        line-height: 16px;
        text-align: center;
        font-weight: 500;
        letter-spacing: 0.4;
        border-radius: 8px;
        cursor: pointer;
        color: @black06;
        border-radius: 12px;
      }
      &__dropdown {
        padding: 8px;
        width: 172px;
        background: @white;
        box-shadow:
          0px 0.5px 5px rgba(0, 0, 0, 0.039),
          0px 3.75px 11px rgba(0, 0, 0, 0.19);
        border-radius: 12px;
        position: absolute;
        right: 0px;
        top: 24px;
        z-index: 3;

        &-link {
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
        }
      }
    }
  }

  &__content {
    width: 460px;
    height: 600px;
    position: relative;
    padding-left: 340px;
  }
}
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.3s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}
.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(2em, 0);
}
.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-2em, 0);
}
</style>
