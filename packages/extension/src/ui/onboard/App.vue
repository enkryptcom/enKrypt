<template>
  <div class="onboard__container">
    <logo class="onboard__logo"></logo>
    <div class="onboard__wrap">
      <a
        v-if="$route.name != 'new-wallet'"
        class="onboard__back"
        @click="$router.go(-1)"
      >
        <arrow-back />
      </a>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import Logo from "@action/icons/common/logo.vue";
import ArrowBack from "@action/icons/common/arrow-back.vue";
</script>

<style lang="less">
@import "~@action/styles/theme.less";

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  font-size: 0;
}

.onboard {
  &__logo {
    position: absolute;
    left: 32px;
    top: 28px;
  }

  &__back {
    position: absolute;
    top: 8px;
    left: 8px;
    border-radius: 8px;
    cursor: pointer;
    padding: 8px;

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
  }

  &__wrap {
    width: 460px;
    height: 600px;
    background: @white;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
    border-radius: 12px;
    padding: 56px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
