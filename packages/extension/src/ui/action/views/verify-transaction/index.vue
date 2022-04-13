<template>
  <div class="container">
    <div v-if="!!selected" class="verify-transaction">
      <div class="verify-transaction__header">
        <h3>Verify Transaction</h3>
        <a class="verify-transaction__close" @click="close">
          <close-icon />
        </a>
      </div>

      <p class="verify-transaction__description">
        Double check the information and confirm transaction
      </p>
      <div class="verify-transaction__info">
        <verify-transaction-network
          v-show="!!selectedNetwork"
          :network="selectedNetwork"
        ></verify-transaction-network>
      </div>

      <div class="verify-transaction__buttons">
        <div class="verify-transaction__buttons-cancel">
          <base-button title="Back" :click="close" :gray="true" />
        </div>
        <div class="verify-transaction__buttons-send">
          <base-button title="Confirm and send" :click="sendAction" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "VerifyTransaction",
};
</script>

<script setup lang="ts">
import { defineProps, onMounted, ref, defineExpose } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import VerifyTransactionNetwork from "./components/verify-transaction-network.vue";
import TabState from "@/libs/tab-state";
import { NodeType } from "@/types/provider";
import { getAllNetworks } from "@/libs/utils/networks";

const tabstate = new TabState();
const route = useRoute();
const router = useRouter();
const networks: NodeType[] = getAllNetworks();

const selected: string = route.params.id as string;
let selectedNetwork = ref(undefined);
defineExpose({ selectedNetwork });

onMounted(async () => {
  const curNetwork = await tabstate.getSelectedNetWork();
  (selectedNetwork.value as unknown as NodeType) = networks.find(
    (net) => net.name === curNetwork
  ) as NodeType;
});

defineProps({});

const close = () => {
  router.go(-1);
};

const sendAction = () => {
  console.log("sendAction");
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;
}

.verify-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 24px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background: @black007;
    }
  }

  &__description {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    padding: 4px 141px 16px 32px;
    margin: 0;
  }

  &__info {
    border: 1px solid @gray02;
    box-sizing: border-box;
    border-radius: 10px;
    margin: 0 32px 0 32px;
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 32px 32px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;

    &-cancel {
      width: 170px;
    }

    &-send {
      width: 218px;
    }
  }
}
</style>
