<template>
  <a class="network-assets__header">
    <div class="network-assets__header__token">
      <p>Token</p>
    </div>
    <div class="network-assets__header__last24h">
      <p>Last 24h</p>
    </div>
    <div class="network-assets__header__price">
      <p>Value</p>
    </div>
  </a>
</template>

<script setup lang="ts"></script>

<style lang="less">
@import '@action/styles/theme.less';
.network-assets {
  &__header {
    padding: 10px 24px 2px 24px;
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: end;
    flex-direction: row;
    p {
      color: @black06;
      font-size: 10px;
      font-weight: 500;
      line-height: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin: 0;
    }
    &__token {
      flex: 1;
      min-width: 0;
      p {
        padding-left: 52px;
      }
    }

    &__last24h {
      width: 80px;
      flex-shrink: 0;
      p {
        text-align: center;
      }
    }

    &__price {
      width: 90px;
      flex-shrink: 0;
      p {
        text-align: end;
      }
    }
  }
}
</style>
