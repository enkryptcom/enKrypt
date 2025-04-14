<template>
  <button v-if="!!token" class="swap-token-select" @click="open">
    <div class="swap-token-select__image">
      <img
        :src="token.logoURI"
        alt=""
        @error="imageLoadError"
        width="28px"
        height="28px"
      />
    </div>
    <div class="swap-token-select__info">
      <h5>
        {{ $filters.truncate(token.symbol, 5) }}
      </h5>
    </div>

    <div class="swap-token-select__arrow">
      <switch-arrow />
    </div>
  </button>
  <a v-else class="swap-token-select" @click="open">
    <div v-show="!token" class="swap-token-select__info">
      <h4>Select token</h4>
    </div>

    <div class="swap-token-select__arrow">
      <switch-arrow />
    </div>
  </a>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import { TokenType } from '@enkryptcom/swap';
import { imageLoadError } from '@/ui/action/utils/misc';

const isOpen = ref(false);
const emit = defineEmits<{
  (e: 'toggle:select', isOpen: boolean): void;
}>();

const props = defineProps({
  token: {
    type: Object as PropType<TokenType | null>,
    default: () => {
      return {};
    },
  },
});

const open = () => {
  isOpen.value = !isOpen.value;
  emit('toggle:select', isOpen.value);
};
</script>

<style lang="less">
@import '@action/styles/theme.less';
.swap-token-select {
  height: 36px;
  background: @lightSurfaceBg;
  box-sizing: border-box;
  border-radius: 32px;
  min-width: 99px;
  padding: 4px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  transition: background 300ms ease-in-out;

  &:hover {
    background: @black007;
  }

  &__image {
    background: @buttonBg;
    box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.16) inset;
    min-width: 28px;
    max-width: 28px;
    height: 28px;
    border-radius: 100%;
    overflow: hidden;
    margin-right: 8px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  &__info {
    h5 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
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
  }
  &__arrow {
    margin-left: auto;
    width: 24px;
    height: 24px;
    margin-right: -4px;
  }
}
</style>
