<template>
  <div class="dapp-connecting">
    <div class="dapp-connecting__wrap">
      <img
        class="dapp-connecting__logo"
        src="@/ui/action/icons/raw/uniswap.png"
      />
      <connecting-icon class="dapp-connecting__link" />
      <img
        class="dapp-connecting__logo"
        src="@/ui/action/icons/raw/dapp-browser.png"
      />
      <connecting-ellipse
        class="dapp-connecting__ellipse"
        :class="{ show: isConnecting }"
      />
      <p class="dapp-connecting__status" :class="{ show: isConnecting }">
        Connecting
      </p>

      <div class="dapp-connecting__done" :class="{ show: isConnected }">
        <connected-icon />
      </div>
      <p class="dapp-connecting__status" :class="{ show: isConnected }">
        Connected
      </p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "DappConnecting",
};
</script>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ConnectingIcon from "@action/icons/connect/connecting-icon.vue";
import ConnectingEllipse from "@action/icons/connect/connecting-ellipse.vue";
import ConnectedIcon from "@action/icons/connect/connected-icon.vue";

let isConnecting = ref(false);
let isConnected = ref(false);

defineProps({});

onMounted(() => {
  setTimeout(() => {
    isConnecting.value = true;
  }, 1000);

  setTimeout(() => {
    isConnecting.value = false;
  }, 4000);

  setTimeout(() => {
    isConnected.value = true;
  }, 4300);
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.dapp-connecting {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 121;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
        100% 50% at 100% 50%,
        rgba(250, 250, 250, 0.92) 0%,
        rgba(250, 250, 250, 0.98) 100%
      )
      /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */,
    @primary;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039), 0px 7px 24px rgba(0, 0, 0, 0.19);

  &__wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  &__logo {
    width: 64px;
    height: 64px;
    box-shadow: 0px 2px 16px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    position: relative;
    z-index: 1;
  }

  &__link {
    margin: 0 18px;
  }

  &__status {
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 28px;
    text-align: center;
    letter-spacing: 0.15px;
    color: @primaryLabel;
    margin: 68px 0 0 0;
    position: absolute;
    width: 100%;
    left: 0px;
    top: 64px;
    opacity: 0;
    transition: opacity 300ms ease-in-out;

    &.show {
      opacity: 1;
    }
  }

  &__ellipse {
    position: absolute;
    left: 27px;
    top: -43px;
    opacity: 0;
    transition: opacity 300ms ease-in-out;

    &.show {
      opacity: 1;
    }
  }

  &__done {
    position: absolute;
    width: 112px;
    height: 112px;
    left: 46px;
    top: -24px;
    border-radius: 100%;
    background: @white;
    box-shadow: 0px 2px 16px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transition: opacity 300ms ease-in-out;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    z-index: 2;

    &.show {
      opacity: 1;
    }
  }
}
</style>
