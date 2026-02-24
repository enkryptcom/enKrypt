<template>
  <a class="send-token-select" @click="emit('update:toggleTokenSelect')">
    <div class="send-token-select__image">
      <img :src="token.icon" alt="" />
    </div>
    <div class="send-token-select__info">
      <h5>{{ token.name }}</h5>
      <p>
        {{ balance ? $filters.formatFloatingPointValue(balance).value : '~' }}
        <span>{{ token.symbol }}</span>
      </p>
    </div>

    <div class="send-token-select__arrow">
      <switch-arrow />
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import { Erc20Token } from '@/providers/ethereum/types/erc20-token';
import { fromBase } from '@enkryptcom/utils';
const emit = defineEmits<{
  (e: 'update:toggleTokenSelect'): void;
}>();

const props = defineProps({
  token: {
    type: Object as PropType<Partial<Erc20Token>>,
    default: () => {
      return {};
    },
  },
});

const balance = computed(() =>
  props.token && props.token.balance
    ? fromBase(props.token.balance, props.token.decimals!)
    : undefined,
);
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-token-select {
  height: 60px;
  background: @white;
  margin: 0 24px 8px 24px;
  box-sizing: border-box;
  border: 1.5px solid rgba(98, 126, 234, 0.15);
  border-radius: 14px;
  width: calc(~'100% - 48px');
  padding: 12px 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  transition: all 200ms ease-in-out;
  box-shadow: 0 2px 8px rgba(98, 126, 234, 0.06);

  &:hover {
    border-color: rgba(98, 126, 234, 0.3);
    background: rgba(98, 126, 234, 0.02);
    box-shadow: 0 2px 8px rgba(98, 126, 234, 0.08);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &__image {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 12px;
    overflow: hidden;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;

    h5 {
      font-style: normal;
      font-weight: 600;
      font-size: 15px;
      line-height: 20px;
      color: @primaryLabel;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.2px;
      color: @secondaryLabel;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;

      span {
        font-variant: small-caps;
        font-weight: 500;
        color: @tertiaryLabel;
      }
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 6px;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 8px;
    transition: all 200ms ease-in-out;
    background: rgba(0, 0, 0, 0.04);

    svg {
      opacity: 0.6;
      transition: opacity 150ms ease-in-out;
    }
  }

  &:hover &__arrow {
    background: rgba(98, 126, 234, 0.1);

    svg {
      opacity: 1;
    }
  }
}
</style>
