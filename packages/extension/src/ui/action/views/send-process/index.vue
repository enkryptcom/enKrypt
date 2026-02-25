<template>
  <component
    :is="isWindowPopup ? 'div' : AppDialog"
    v-model="model"
    is-centered
    width="320px"
  >
    <div
      :class="{
        'send-process__container send-process__container__popup': isWindowPopup,
      }"
    >
      <div class="send-process">
        <div class="send-process__wrap">
          <div class="send-process__animation">
            <send-process-animation
              v-show="!isDone"
              class="send-process__loading"
            />
            <send-checkmark-animation
              v-show="isDone"
              class="send-process__done"
            />
          </div>
          <div class="send-process__info">
            <send-process-amount v-if="!isNft" :token="token" />
            <send-process-nft v-if="isNft" :item="nft" />
            <div class="send-process__info-arrow">
              <arrow-down />
            </div>
            <send-process-account :address="toAddress" :network="network" />
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import AppDialog from '@action/components/app-dialog/index.vue';
import SendProcessAnimation from '@action/icons/send/send-process-animation.vue';
import SendCheckmarkAnimation from '@action/icons/send/send-checkmark-animation.vue';
import ArrowDown from '@action/icons/send/arrow-down.vue';
import SendProcessAccount from './components/send-process-account.vue';
import SendProcessAmount from './components/send-process-amount.vue';
import SendProcessNft from './components/send-process-nft.vue';
import { ToTokenData } from '../../types/token';
import { BaseNetwork } from '@/types/base-network';
import { NFTItemWithCollectionName } from '@/types/nft';

defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => {
      return {};
    },
  },
  isDone: Boolean,
  isError: Boolean,
  token: {
    type: Object as PropType<ToTokenData>,
    default: () => {
      return {};
    },
  },
  toAddress: {
    type: String,
    default: '',
  },
  isNft: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  nft: {
    type: Object as PropType<NFTItemWithCollectionName>,
    default: () => {
      return {};
    },
  },
  isWindowPopup: Boolean,
});

const model = defineModel<boolean>();
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.send-process {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  &__container {
    width: 800px;
    height: 600px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    margin: 0;
    box-sizing: border-box;
    position: absolute;
    z-index: 101;
    top: 0;
    &__popup {
      left: -195px;
    }
  }

  &__wrap {
    position: relative;
    background: @white;
    width: 320px;
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.2),
      0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    z-index: 102;
    overflow: hidden;
    animation: fadeInScale 0.3s ease-out;
  }

  &__animation {
    width: 100%;
    height: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    background: linear-gradient(
      180deg,
      rgba(98, 126, 234, 0.06) 0%,
      transparent 100%
    );
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 3px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(98, 126, 234, 0.3),
        transparent
      );
      border-radius: 2px;
    }
  }

  &__info {
    width: 100%;
    min-height: 200px;
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 16px;
    box-sizing: border-box;
    border-top: 1px solid rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 0;

    &-arrow {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px 0;
      opacity: 0.4;

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }

  &__loading {
    width: 120px;
    height: 120px;
    animation: pulse 2s ease-in-out infinite;
  }

  &__done {
    width: 120px;
    height: 120px;
  }
}
</style>
