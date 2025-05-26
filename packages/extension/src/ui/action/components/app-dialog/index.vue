<template>
  <teleport to="#app">
    <Transition name="modaltransition">
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
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@action/icons/common/close-icon.vue';
import { useMenuStore } from '@action/store/menu-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

/**
 * This component is a dialog that can be used to display content in a modal.
 * It has a close button and a backdrop that can be clicked to close the dialog.
 * The dialog can be centered or not centered.
 * By default, it aligned to cover the right side of the screen and be the max width of the content that does not cover menu.
 *
 * !!! Do not use it if pinia store is not defined, as it depends on the menu store.
 *
 * @emits close:dialog - Emits when the dialog is closed.
 * @model - Controls the visibility of the dialog.
 *
 * @example Basic Dialog
 * <app-dialog v-model="dialogModel" @close:dialog="closeDialogFN">
 *    <div> hello world </div>
 * </app-dialog>
 * @example Centered Dialog with custom width
 *
 * <app-dialog v-model="dialogModel" width="500px" isCentered>
 *    <div> hello world </div>
 * </app-dialog>
 *
 */
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
    'scrollbar-width': 'none',
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
  transition: opacity 0.3s ease;

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
    transition: all 0.3s ease;

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
.modaltransition-enter-from {
  opacity: 0;
}

.modaltransition-leave-to {
  opacity: 0;
}

.modaltransition-enter-from .app-dialog__wrap,
.modaltransition-leave-to .app-dialog__wrap {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
