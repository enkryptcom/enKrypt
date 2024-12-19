<template>
  <a
    ref="target"
    class="app-menu__link hover-transition-no-bg"
    :class="[
      { active: isActive },
      { 'sticky-top': isStickyTop },
      { 'sticky-bottom': isStickyTop === false },
    ]"
    @mouseover="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="app-menu__link__block">
      <div style="position: relative">
        <img ref="imageTag" :src="network.icon" alt="" />
        <new-icon
          v-if="newNetworkTags.networks.includes(network.name)"
          class="tag-new"
        />
      </div>
      <span>{{ network.name_long }} </span
      ><test-network-icon
        v-if="network.isTestNetwork"
        class="test-network-icon"
      />
    </div>
    <div class="app-menu__link__block">
      <DragIcon
        v-if="canDrag"
        :class="[
          'app-menu__link__block__drag',
          { 'app-menu__link__block__drag__hovered': isHovered },
        ]"
      />
      <p
        v-if="showIsPinned"
        :class="[
          'app-menu__link__block__pin',
          {
            'app-menu__link__block__pin__active': pinIconIsActive,
          },
        ]"
        @click="setPinned"
      >
        <pin-icon :is-pinned="isPinned" :is-active="pinIconIsActive" />
      </p>
    </div>
  </a>
</template>

<script setup lang="ts">
import { NodeType } from '@/types/provider';
import { PropType, ref, watch, computed, onMounted, nextTick } from 'vue';
import TestNetworkIcon from '@action/icons/common/test-network-icon.vue';
import NewIcon from '@action/icons/asset/new-icon.vue';
import PinIcon from '@action/icons/actions/pin.vue';
import DragIcon from '@action/icons/common/drag-icon.vue';
const props = defineProps({
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
  isPinned: {
    type: Boolean,
    required: true,
  },
  scrollPosition: {
    type: Number,
    default: 0,
  },
  canDrag: {
    type: Boolean,
    required: false,
  },
  newNetworkTags: {
    type: Object as PropType<{ networks: string[]; swap: string[] }>,
    default: () => {
      return { networks: [], swap: [] };
    },
  },
});
const imageTag = ref<HTMLImageElement | null>(null);

const emit = defineEmits<{
  (e: 'update:gradient', data: string): void;
  (e: 'update:pinNetwork', network: string, isPinned: boolean): void;
}>();
// NOTE: WHAT IS THIS?
const componentToHex = (c: number) => {
  const hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
};
const getAverageRGB = (imgEl: HTMLImageElement) => {
  const blockSize = 5, // only visit every 5 pixels
    defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
    canvas = document.createElement('canvas'),
    context = canvas.getContext && canvas.getContext('2d'),
    rgb = { r: 0, g: 0, b: 0 };
  let data: ImageData;
  let count = 0;
  let i = -4;

  if (!context) {
    return defaultRGB;
  }
  const height = (canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height);
  const width = (canvas.width =
    imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width);
  context.drawImage(imgEl, 0, 0);
  try {
    data = context.getImageData(0, 0, width, height);
  } catch (e) {
    return defaultRGB;
  }
  const length = data.data.length;
  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }
  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);
  emit(
    'update:gradient',
    `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`,
  );
};
watch(
  () => props.isActive,
  () => {
    if (props.isActive) getAverageRGB(imageTag.value!);
  },
);
/** ------------------------
 * Buttons
 * ------------------------*/
const isHovered = ref(false);

/**
 * Computed property to determine whether to show the "Pin" button.
 *
 * This property returns `true` if the network is Pinned,
 * otherwise it returns `false`.
 *
 * @returns {boolean} - `true` if the "Pin" button should be shown, `false` otherwise.
 */
const isPinned = computed(() => {
  return props.isPinned;
});

/**
 * Computed property to determine if the menu item should be shown as pinned.
 *
 * @returns {boolean} - Returns true if the menu item is active, or if it is either pinned or hovered.
 */
const showIsPinned = computed(() => {
  return props.isActive ? true : isPinned.value || isHovered.value;
});

const pinIconIsActive = computed(() => {
  return props.isActive || isHovered.value;
});

const setPinned = async () => {
  emit('update:pinNetwork', props.network.name, !isPinned.value);
};
/** ------------------------
 * Scroll
------------------------*/
const target = ref<HTMLElement | null>(null);
/**
 * Reactive variable to determine the sticky state of the menu item.
 * It is set to `true` if the menu item is sticky at the top, `false` if it is sticky at the bottom, and `undefined` if it is not sticky.
 */
const isStickyTop = ref<boolean | undefined>(undefined);

/**
 * Function to determine the position of the menu item and set its sticky state top or bottom.
 * It calculates the position based on the scroll position, direction and the offset.
 */
const getPosition = () => {
  const height = target.value?.offsetHeight || 0;
  const offset = -height;
  const anchorTop = (target.value?.offsetTop || 0) + offset;

  if (props.scrollPosition > anchorTop) {
    isStickyTop.value = true;
  } else {
    isStickyTop.value = false;
  }
};

/**
 * Ensures that selected menu items are sticky when the page is mounted.
 */
onMounted(() => {
  nextTick(() => {
    if (props.isActive) {
      getPosition();
    }
  });
});

/**
 * Watcher to update the position of the menu item when the scroll position changes.
 */
watch(
  () => props.scrollPosition,
  () => {
    if (props.isActive) {
      getPosition();
    }
  },
);
</script>

<style lang="less">
@import '@action/styles/theme.less';

.tag-new {
  height: 9px;
  padding: 1px 3px 1px 3px;
  background: rgba(0, 122, 255, 1);
  color: #fff !important;
  border-radius: 6px;
  border: 1px solid @white;
  position: absolute;
  left: 23px;
  top: -5px;
}

.app-menu {
  &__link {
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    justify-self: center;
    align-items: center;
    flex-direction: row;
    width: 97%;
    min-height: 40px !important;
    max-height: 40px;
    margin-bottom: 3px;
    margin-top: 3px;
    cursor: pointer;
    position: relative;
    border-radius: 10px;
    padding-right: 8px;
    transition: top 1s linear;
    transition: bottom 1s linear;
    &:first-of-type {
      margin-top: 0; /* Removes top margin for the first element */
    }
    &__block {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      gap: 4px;
      &__pin {
        max-width: 32px;
        max-height: 24px;
        padding: 5px 8px 3px 8px;
        background: transparent;
        border-radius: 24px;
        transition: @opacity-noBG-transition;
        &__active {
          background: @primaryLight;
        }
      }
      &__drag {
        max-width: 32px;
        max-height: 24px;
        padding: 5px 8px 3px 8px;
        background: transparent;
        border-radius: 24px;
        opacity: 0;
        transition: opacity 0.3s ease-in;
        &__hovered {
          opacity: 100;
        }
      }
    }
    &:hover {
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
      background: @white;
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.16);
      position: -webkit-sticky;
      position: sticky;
      z-index: 2;
      opacity: 100;
      span {
        font-weight: 500;
      }
      &:hover {
        background: @white;
      }
    }
    /* Sticky to top or bottom */
    &.sticky-top {
      top: 0;
    }

    &.sticky-bottom {
      bottom: 0;
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
.test-network-icon {
  height: 14px;
  width: 14px;
}
</style>
