<template>
  <div class="network-assets-solana-staking-banner">
    <a
      href="javascript:void(0);"
      @click="openStakingLink"
      class="network-assets-solana-staking-banner__wrap"
    >
      <img
        src="@action/assets/banners/solana-staking-banner-bg.png"
        class="network-assets-solana-staking-banner__bg"
        alt=""
      />
      <img
        src="@action/assets/banners/solana-staking-banner-tokens-img.png"
        class="network-assets-solana-staking-banner__image"
        alt=""
      />

      <div class="network-assets-solana-staking-banner__content">
        <enkrypt-staking-logo-white
          class="network-assets-solana-staking-banner__content-logo"
        />
        <h5>Put your SOL to work — safely & easily.</h5>
        <div class="network-assets-solana-staking-banner__advantages">
          <div>
            <consistent-rewards-icon />
            <span>Consistent Rewards</span>
          </div>
          <div>
            <attractive-apr-icon />
            <span>Attractive APR</span>
          </div>
        </div>
      </div>
    </a>

    <a class="network-assets-solana-staking-banner__close" @click.stop="close">
      <close-icon-white />
    </a>
  </div>
</template>

<script setup lang="ts">
import CloseIconWhite from '@action/icons/common/close-icon-white.vue';
import EnkryptStakingLogoWhite from '@action/icons/common/enkrypt-staking-logo-white.vue';
import ConsistentRewardsIcon from '@action/icons/banners/consistent-rewards-icon.vue';
import AttractiveAprIcon from '@action/icons/banners/attractive-apr-icon.vue';
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
  trackSolanaStakingBanner(SolanaStakingBannerEvents.SolanaWalletClicked);
  openLink('https://staking.enkrypt.com');
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.network-assets-solana-staking-banner {
  padding: 0 16px 8px 16px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  display: block;
  text-decoration: none;

  &__wrap {
    width: 100%;
    height: 110px;
    background: #ffffff;
    border-radius: 12px;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    display: block;
    text-decoration: none;
  }

  &__bg {
    height: 110px;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
  }

  &__image {
    height: 110px;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
  }

  &__content {
    width: 100%;
    height: 110px;
    border-radius: 12px;
    padding: 5px 24px 5px 118px;
    box-sizing: border-box;
    overflow: hidden;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;

    &-logo {
      margin: 15px 0 1px 0;
    }

    h5 {
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 24px;
      /* 125% */
      letter-spacing: 0.15px;
      color: @white;
      margin: 0 0 1px 0;
    }
  }

  &__advantages {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;

    div {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      margin-right: 12px;

      &:last-child {
        margin: 0;
      }

      svg {
        margin-right: 4px;
      }

      span {
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
        /* 125% */
        letter-spacing: 0.5px;
        color: @white;
        opacity: 0.7;
      }
    }
  }

  &__close {
    position: absolute;
    top: 0;
    right: 16px;
    cursor: pointer;
    transition: opacity 300ms ease-in-out;
    opacity: 1;
    font-size: 0;
    width: 32px;
    height: 32px;
    z-index: 5;

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
