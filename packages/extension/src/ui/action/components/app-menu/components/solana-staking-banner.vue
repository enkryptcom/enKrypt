<template>
  <div class="solana-staking-banner">
    <img src="@action/assets/banners/solana-staking-banner.png" alt="" />

    <div class="solana-staking-banner__content">
      <enkrypt-staking-logo />
      <h5>Put your SOL to work — safely & easily.</h5>
      <a href="javascript:void(0);" @click="openStakingLink" class="button"
        ><span>Start Staking Now</span></a
      >
    </div>

    <a class="solana-staking-banner__close" @click="close">
      <close-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@action/icons/common/close-icon.vue';
import EnkryptStakingLogo from '@action/icons/common/enkrypt-staking-logo.vue';
import { trackSolanaStakingBanner } from '@/libs/metrics';
import { openLink } from '@action/utils/browser';
import { SolanaStakingBannerEvents } from '@/libs/metrics/types';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const close = () => {
  emit('close');
};
const openStakingLink = async () => {
  trackSolanaStakingBanner(SolanaStakingBannerEvents.NetworkListClicked);
  setTimeout(() => {
    openLink('https://staking.enkrypt.com');
  }, 1000);
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.solana-staking-banner {
  position: absolute;
  width: 324px;
  height: 128px;
  left: 8px;
  bottom: 8px;
  background: #ffffff;
  box-shadow:
    0px 8px 16px -6px rgba(0, 0, 0, 0.12),
    0px 6px 8px -6px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 0 129px 0 12px;
  box-sizing: border-box;
  overflow: hidden;
  z-index: 2;

  img {
    height: 128px;
    position: absolute;
    right: 0;
    top: 0;
  }

  &__content {
    padding: 8px 0 0 0;

    svg {
      margin-bottom: 4px;
    }

    h5 {
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 20px;
      /* 125% */
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0 0 8px 0;
      background: linear-gradient(to left, #14f195, #64abf2, #9945ff);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .button {
      text-decoration: none;
      width: auto;
      width: 163px;
      height: 32px;
      font-size: 12px;
      line-height: 32px;
    }
  }

  &__close {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    transition: opacity 300ms ease-in-out;
    opacity: 1;
    font-size: 0;
    width: 32px;
    height: 32px;

    svg {
      width: 32px;
      height: 32px;
    }

    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
