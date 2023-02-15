<template>
  <div class="provider-pages__container">
    <div class="provider-pages__wrap">
      <router-view />
    </div>
  </div>
</template>

<style lang="less">
@import "~@action/styles/theme.less";
@import (css)
  url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap");

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  font-family: "Roboto", sans-serif;
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
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }
}
</style>
