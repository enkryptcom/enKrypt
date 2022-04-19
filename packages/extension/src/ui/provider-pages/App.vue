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
    width: 460px;
    height: 600px;
    background: @white;
    padding: 12px 56px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
  }
}
</style>
