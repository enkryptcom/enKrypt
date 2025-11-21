<template>
  <div class="blocked__container">
    <logo class="blocked__logo" />
    <div class="blocked__wrap">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less">
@import '@action/styles/theme.less';
@import (css)
  url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  font-size: 0;
  font-family: 'Roboto', sans-serif;
  overflow-y: auto;
}

.blocked {
  &__logo {
    position: absolute;
    left: 32px;
    top: 24px;
  }

  &__back {
    position: absolute;
    top: 8px;
    left: 8px;
    border-radius: 8px;
    cursor: pointer;
    padding: 8px;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__container {
    background-color: @lightBg;
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    min-height: 700px;
  }

  &__wrap {
    width: 460px;
    height: 650px;
    background: @white;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
    border-radius: 12px;
    padding: 40px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;

    &--ready {
      background: transparent;
      box-shadow: none;
    }

    &--auto-height {
      height: auto;
      max-height: 600px;
    }
  }

  &__info {
    position: absolute;
    right: 8px;
    top: 8px;
    background: @tip;
    border: 1px solid rgba(0, 0, 0, 0.1);
    width: 301px;
    height: 96px;
    border-radius: 10px;
    padding: 12px 20px;
    box-sizing: border-box;

    h4 {
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @black07;
      margin: 0;
    }
  }

  &__online {
    width: 16px;
    height: 16px;
  }
}
</style>
