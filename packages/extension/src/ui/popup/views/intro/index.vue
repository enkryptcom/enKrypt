<template>
  <div class="container">
    <div class="intro">intro</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import MEWLogo from '../../icons/common/mew_logo.vue'

export default defineComponent({
  name: "Intro",
  components: {},
});
</script>

<style lang="less" scoped>
@import "../../styles/theme.less";
@import "../../styles/custom-scroll.less";

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

  &__block {
  }

  &__link-block {
  }
}
</style>
