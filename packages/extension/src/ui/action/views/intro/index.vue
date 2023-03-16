<template>
  <div class="container"></div>
</template>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 600px;
  overflow-x: hidden;
  overflow-y: scroll;
  position: relative;
  background: @lightBg;
}

.intro {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>
