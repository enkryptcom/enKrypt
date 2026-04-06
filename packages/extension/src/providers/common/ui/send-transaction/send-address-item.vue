<template>
  <a
    class="send-address-item"
    @click="emit('selected:account', account.address)"
  >
    <div class="send-address-item__info">
      <img :src="network.identicon(network.displayAddress(account.address))" />

      <div class="send-address-item__name">
        <h4 v-if="account.name != null">{{ account.name }}</h4>
        <p>
          {{
            $filters.replaceWithEllipsis(
              network.displayAddress(account.address),
              6,
              4,
            )
          }}
        </p>
      </div>
    </div>

    <done-icon v-show="isChecked" class="send-address-item__checked" />
  </a>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { BaseNetwork } from '@/types/base-network';
import DoneIcon from '@action/icons/common/done_icon.vue';

const emit = defineEmits<{
  (e: 'selected:account', address: string): void;
}>();

defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  account: {
    type: Object as PropType<{
      name?: string;
      address: string;
    }>,
    default: () => {
      return {};
    },
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 52px;
  cursor: pointer;
  text-decoration: none;
  transition: all 200ms ease-in-out;
  border-radius: 12px;
  padding: 0 4px;
  box-sizing: border-box;

  &:hover {
    background: rgba(98, 126, 234, 0.08);
  }

  &__number {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;
    width: 24px;
  }

  &__info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    height: 52px;
    flex: 1;
    min-width: 0;

    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
      margin-left: 4px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
  }

  &__name {
    flex: 1;
    min-width: 0;

    h4 {
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: 0.1px;
      color: @primaryLabel;
      margin: 0 0 2px 0;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 13px;
      line-height: 18px;
      letter-spacing: 0.2px;
      color: @secondaryLabel;
      margin: 0 !important;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__action {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    a {
      display: inline-block;
      font-size: 0;
      margin-right: 10px;
    }
  }

  &__checked {
    margin-right: 8px;
    color: @primary;
  }
}
</style>
