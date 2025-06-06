<template>
  <component
    :is="isHardware ? 'div' : AppDialog"
    v-model="model"
    @close:dialog="closePopup"
    is-centered
    width="320px"
  >
    <teleport to="#app" :disabled="!isHardware">
      <div
        v-if="model"
        class="swap-initiated"
        :class="{ 'swap-initiated__popup': isHardware }"
      >
        <div v-if="isHardware" class="swap-initiated__popup__overlay"></div>
        <div
          class="swap-initiated__wrap"
          :class="{ 'swap-initiated__wrap__popup': isHardware }"
        >
          <div class="swap-initiated__animation">
            <div v-if="isLoading && !isError">
              <Vue3Lottie
                :animation-data="LottieStatus"
                :loop="true"
                class="swap-initiated__loading"
              />
              <p v-if="isHardware">
                Follow further instructions on your hardware wallet device
              </p>
            </div>

            <div v-if="!isLoading && !isError">
              <Vue3Lottie
                class="swap-initiated__loading"
                :animation-data="LottieSwapInitiated"
                :loop="false"
              />

              <h4>Swap initiated</h4>
              <p>
                Once completed, {{ toToken.symbol }} will be deposited to the
                address you specified.
              </p>
              <a @click="closePopup">Finish</a>
            </div>
            <div v-if="isError">
              <Vue3Lottie
                class="swap-initiated__loading"
                :animation-data="LottieError"
                :loop="false"
              />
              <p>
                {{ errorMessage }}
              </p>
              <p v-if="network.name !== NetworkNames.Solana">
                <a @click="$emit('update:tryAgain')">Try again</a>
              </p>
              <a @click="closePopup">Cancel</a>
            </div>
          </div>
          <div class="swap-initiated__info">
            <swap-initiated-amount :token="fromToken" :amount="fromAmount" />
            <div class="swap-initiated__info-arrow">
              <arrow-down />
            </div>
            <swap-initiated-amount :token="toToken" :amount="toAmount" />
          </div>
        </div>
      </div>
    </teleport>
  </component>
</template>

<script setup lang="ts">
import LottieSwapInitiated from '@action/assets/animation/swap-initiated.json';
import ArrowDown from '@action/icons/send/arrow-down.vue';
import SwapInitiatedAmount from './components/swap-initiated-amount.vue';
import LottieError from '@action/assets/animation/error-big.json';
import LottieStatus from '@action/assets/animation/status.json';
import { Vue3Lottie } from 'vue3-lottie';
import { TokenType } from '@enkryptcom/swap';
import { NetworkNames } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import AppDialog from '@action/components/app-dialog/index.vue';

interface IProps {
  fromToken: TokenType;
  toToken: TokenType;
  fromAmount: string;
  toAmount: string;
  isLoading: boolean;
  isHardware: boolean;
  isError: boolean;
  errorMessage: string;
  network: BaseNetwork;
}

const emit = defineEmits<{
  (e: 'update:close'): void;
  (e: 'update:tryAgain'): void;
}>();

defineProps<IProps>();
const model = defineModel<boolean>();
const closePopup = () => {
  model.value = false;
  emit('update:close');
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.swap-initiated {
  &__popup {
    position: absolute;
    z-index: 100;
    width: 100%;
    height: 100%;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    &__overlay {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.32);
      margin: 0;
      box-sizing: border-box;
      position: absolute;
      z-index: 101;
      top: 0;
    }
  }

  // &__container {
  //   height: 600px;
  //   background: rgba(0, 0, 0, 0.32);
  //   margin: 0;
  //   box-sizing: border-box;
  //   position: absolute;
  //   z-index: 101;
  //   top: 0;

  //   &__expanded {
  //     width: 800px;
  //     left: -340px;
  //   }
  //   &__collapsed {
  //     width: 516px;
  //     left: -56px;
  //   }
  // }
  &__wrap {
    &__popup {
      position: relative;
      background: @white;
      width: 320px;
      height: 432px;
      box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
      border-radius: 12px;
      z-index: 102;
    }
    overflow: hidden;
  }
  &__animation {
    width: 100%;
    height: 264px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 0 32px;
    box-sizing: border-box;

    h4 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      text-align: center;
      color: @primaryLabel;
      margin: 0 0 16px 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0 0 16px 0;
    }

    a {
      width: 261px;
      height: 40px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 10px;
      display: inline-block;
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 40px;
      letter-spacing: 0.5px;
      text-align: center;
      color: @primaryLabel;
      text-decoration: none;
      cursor: pointer;
    }
  }
  &__info {
    width: 100%;
    height: 168px;
    background-color: @lightBg;
    padding: 16px;
    box-sizing: border-box;
    &-arrow {
      padding-left: 20px;
    }
  }
  &__loading {
    width: 256px;
    height: 48px;
    margin-bottom: 8px;
  }
  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }
}
</style>
