<template>
  <div
    class="send-process__container"
    :class="{ popup: isWindowPopup, nopopup: !isWindowPopup }"
  >
    <div class="send-process">
      <div class="send-process__wrap">
        <div class="send-process__animation">
          <send-process-animation
            v-show="!isDone"
            class="send-process__loading"
          />
          <send-checkmark-animation
            v-show="isDone"
            class="send-process__done"
          />
        </div>
        <div class="send-process__info">
          <send-process-amount v-if="!isNft" :token="token" />
          <send-process-nft v-if="isNft" :item="nft" />
          <div class="send-process__info-arrow">
            <arrow-down />
          </div>
          <send-process-account :address="toAddress" :network="network" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import SendProcessAnimation from "@action/icons/send/send-process-animation.vue";
import SendCheckmarkAnimation from "@action/icons/send/send-checkmark-animation.vue";
import ArrowDown from "@action/icons/send/arrow-down.vue";
import SendProcessAccount from "./components/send-process-account.vue";
import SendProcessAmount from "./components/send-process-amount.vue";
import SendProcessNft from "./components/send-process-nft.vue";
import { nft } from "@action/types/mock";
import { ToTokenData } from "../../types/token";
import { BaseNetwork } from "@/types/base-network";

defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => {
      return {};
    },
  },
  isDone: Boolean,
  isError: Boolean,
  token: {
    type: Object as PropType<ToTokenData>,
    default: () => {
      return {};
    },
  },
  toAddress: {
    type: String,
    default: "",
  },
  isNft: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isWindowPopup: Boolean,
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.send-process {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  &__container {
    width: 800px;
    height: 600px;
    background: rgba(0, 0, 0, 0.32);
    margin: 0;
    box-sizing: border-box;
    position: absolute;
    z-index: 101;
    top: 0;
    &.popup {
      left: -195px;
    }

    &.nopopup {
      left: -340px;
    }
  }

  &__wrap {
    position: relative;
    background: @white;
    width: 320px;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
    border-radius: 12px;
    z-index: 102;
    overflow: hidden;
  }

  &__animation {
    width: 100%;
    height: 128px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__info {
    width: 100%;
    height: 224px;
    background-color: @lightBg;
    padding: 16px;
    box-sizing: border-box;

    &-arrow {
      padding-left: 20px;
    }
  }

  &__loading {
    width: 128px;
    height: 128px;
  }

  &__done {
    width: 128px;
    height: 128px;
  }
}
</style>
