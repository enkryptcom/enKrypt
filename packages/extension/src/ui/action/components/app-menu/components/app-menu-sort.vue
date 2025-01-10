<template>
  <div
    class="app__menu__sort"
    @mouseover="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <a
      ref="toggleSortButton"
      class="app__menu__sort__button hover-transition-no-bg"
      @click="setActiveSort(NetworkSortOption.Name)"
    >
      <!-- <sort-btn-icon /> -->
      <span class="app__menu__sort__button__text">{{ sortString }}</span>
      <sort-direction-icon
        :is-asc="sortBy.direction === NetworkSortDirection.Asc"
      />
    </a>
    <!-- NEXT Release: -->
    <!-- <div
      v-show="isOpenSort"
      ref="dropdownSort"
      class="app__menu__sort__dropdown"
    >
      <a
        class="app__menu__sort__dropdown-link"
        @click="setActiveSort(NetworkSortOption.Name)"
      >
        <span>Name</span>
        <sort-direction-icon
          v-if="sortBy.name === NetworkSortOption.Name"
          :is-asc="sortBy.direction === NetworkSortDirection.Asc"
        />

        <sort-active-icon
          :is-active="sortBy.name == NetworkSortOption.Name"
          class="activeSvg"
        />
      </a>
      <a
        class="app__menu__sort__dropdown-link"
        @click="setActiveSort(NetworkSortOption.Tvl)"
      >
        <span>Total value Locked</span>
        <sort-direction-icon
          v-if="sortBy.name === NetworkSortOption.Tvl"
          :is-asc="sortBy.direction === NetworkSortDirection.Asc"
        />

        <sort-active-icon
          :is-active="sortBy.name == NetworkSortOption.Tvl"
          class="activeSvg"
        />
      </a>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, PropType, computed } from 'vue';
import {
  NetworkSort,
  NetworkSortOption,
  NetworkSortDirection,
} from '@action/types/network-sort';
import SortDirectionIcon from '@/ui/action/icons/actions/sort/sort-direction-icon.vue';
import { trackNetwork } from '@/libs/metrics';
import { NetworkChangeEvents } from '@/libs/metrics/types';

// Next Release Version:
// import { onClickOutside } from '@vueuse/core';
// import SortBtnIcon from '@/ui/action/icons/actions/sort/sort-btn-icon.vue';
// import SortActiveIcon from '@/ui/action/icons/actions/sort/sort-active-icon.vue';

const props = defineProps({
  sortBy: {
    type: Object as PropType<NetworkSort>,
    required: true,
  },
});
const emit = defineEmits<{
  (e: 'update:sort', sortBy: NetworkSort): void;
}>();

const setActiveSort = (_sort: NetworkSortOption) => {
  const newSortBy = { ...props.sortBy };
  if (_sort === props.sortBy.name) {
    newSortBy.direction =
      newSortBy.direction === NetworkSortDirection.Asc
        ? NetworkSortDirection.Desc
        : NetworkSortDirection.Asc;
  } else {
    // Next Release Version: update this function
    newSortBy.name = _sort;
  }
  trackNetwork(NetworkChangeEvents.NetworkSortOptionChanged, {
    sortOption: newSortBy.name,
  });
  emit('update:sort', newSortBy);
};

/** Next Release Version: */
// const isOpenSort = ref(false);
// let timeout: ReturnType<typeof setTimeout> | null = null;
// const dropdownSort = ref(null);

const toggleSortButton = ref(null);

const sortString = computed(() => {
  switch (props.sortBy.name) {
    case NetworkSortOption.Name:
      return 'Name';
    case NetworkSortOption.Tvl:
      return 'Total value Locked';
    default:
      return `${props.sortBy.name} ${props.sortBy.direction}`;
  }
});

/** -------------------
 * Menu Actions
 * ------------------- */
const isHovered = ref<boolean>(false);

/**Next Release Version: */
// const toggleSortMenu = () => {
//   if (timeout != null) {
//     clearTimeout(timeout);

//     timeout = null;
//   }
//   if (isOpenSort.value) {
//     closeSortMenu();
//   } else {
//     isOpenSort.value = true;
//   }
// };
// const closeSortMenu = (_time = 100) => {
//   if (timeout != null) {
//     clearTimeout(timeout);
//   }
//   timeout = setTimeout(() => {
//     isOpenSort.value = false;
//   }, _time);
// };
// onClickOutside(
//   dropdownSort,
//   () => {
//     closeSortMenu();
//   },
//   { ignore: [toggleSortButton] },
// );

// watch(isHovered, () => {
//   if (isOpenSort.value && !isHovered.value) {
//     if (timeout != null) {
//       clearTimeout(timeout);
//       timeout = null;
//     } else {
//       closeSortMenu(1000);
//     }
//   }
//   if (isOpenSort.value && isHovered.value) {
//     if (timeout != null) {
//       clearTimeout(timeout);
//       timeout = null;
//     }
//   }
// });
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
        cursor: pointer;
        color: @black06;
        border-radius: 12px;
        display: flex;
        span {
          padding-left: 4px;
        }
        &__text {
          margin-right: 4px;
        }
      }
      &__dropdown {
        padding: 8px;
        width: 212px;
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
          height: 28px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          flex-direction: row;
          cursor: pointer;
          transition: background 300ms ease-in-out;
          border-radius: 8px;
          padding: 6px 12px 6px 16px;
          &:hover,
          &.active {
            background: rgba(0, 0, 0, 0.04);
          }

          svg {
            margin-left: 8px;
          }
          .activeSvg {
            margin-left: auto;
            height: 20px;
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
