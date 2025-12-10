<template>
  <a class="network-assets__header">
    <div class="network-assets__header__token">
      <p>Token</p>
    </div>
    <div>
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
    padding: 10px 20px 2px 20px;
    position: relative;
    display: flex;
    justify-content: space-between;
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
      width: 196px;
      p {
        padding-left: 48px;
      }
    }

    &__price {
      width: 162px;
      p {
        text-align: end;
      }
    }
  }
}
</style>
