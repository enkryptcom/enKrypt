<template>
  <div class="provider-pages__container">
    <div class="provider-pages__wrap">
      <router-view />
    </div>
  </div>
</template>

<style lang="less">
@import "~@action/styles/theme.less";
body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}
.provider-pages {
  &__container {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  &__wrap {
    max-width: 460px;
    max-height: 600px;
    width: 100%;
    height: 100%;
    background: @white;
    padding: 0 56px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }
}
</style>
