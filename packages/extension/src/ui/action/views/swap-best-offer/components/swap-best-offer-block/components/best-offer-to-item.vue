<template>
  <div class="best-offer-to-item">
    <img :src="require('@/ui/action/icons/raw/yearn.png')" />
    <div class="best-offer-to-item__info">
      <h4>Receive on Polkadot to</h4>
      <p>14Fqi7dFQfRtQRrtBW7BL5m9E1fbTp3dvAnW19AUqEKhWCFd</p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.best-offer-to-item {
  width: 100%;
  background: @buttonBg;
  border-radius: 10px;
  margin: 0 0 8px 0px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  padding: 8px 16px;
  box-sizing: border-box;

  img {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }

  &__info {
    h4 {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @secondaryLabel;
      margin: 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      display: flex;
      align-items: flex-end;
      color: @primaryLabel;
      margin: 0;
      word-break: break-all;
    }
  }
}
</style>
