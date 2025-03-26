<template>
  <teleport to="#app">
    <div v-if="model" :class="[defaultClass, { show: model }]">
      <div class="app-dialog__overlay" @click="closeDialog" />
      <div
        class="app-dialog__wrap"
        :class="[{ show: model }]"
        :style="dialogStyle"
      >
        <a class="app-dialog__close" @click="closeDialog">
          <close-icon />
        </a>

        <slot />
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@action/icons/common/close-icon.vue';
import { useMenuStore } from '@action/store/menu-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: String,
    default: '428px',
  },
  isCentered: {
    type: Boolean,
    default: false,
  },
});
/** -------------------
 * Open Close State
 -------------------*/
const emit = defineEmits<{
  (e: 'close:dialog'): void;
}>();

const model = defineModel<boolean>();

const closeDialog = () => {
  model.value = false;
  emit('close:dialog');
};

/** -------------------
 * Styling
 -------------------*/
const menuStore = useMenuStore();
const { isExpanded } = storeToRefs(menuStore);
const defaultClass = computed(() => {
  const widthClass = isExpanded.value ? 'expanded' : 'collapsed';
  const justifyClass = props.isCentered ? 'is-centered' : 'is-not-centered';
  return `app-dialog app-dialog__${widthClass} app-dialog__${justifyClass}`;
});

const dialogStyle = computed(() => {
  return {
    width: props.width,
  };
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.app-dialog {
  height: 600px;
  top: 0px;
  position: fixed;
  z-index: 105;
  display: none;
  box-sizing: border-box;
  align-items: center;
  flex-direction: row;
  padding: 16px;

  &__expanded {
    width: 800px;
  }
  &__collapsed {
    width: 516px;
  }
  &__is-centered {
    justify-content: center;
  }
  &__is-not-centered {
    justify-content: end;
  }

  &.show {
    display: flex;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

  &__wrap {
    background: @white;
    box-shadow:
      0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    position: relative;
    z-index: 107;
    overflow-y: scroll;
    max-height: 100%;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s,
      visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }

    h2 {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0 0 24px 0;
    }
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;
    z-index: 108;
    &:hover {
      background: @black007;
    }
  }
}
</style>
