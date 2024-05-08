<template>
  <a
    class="send-subnetwork-select"
    @click="emit('update:toggleSubnetworkSelect')"
  >
    <div class="send-subnetwork-select__info">
      <p>Sending from Chain {{ fromNetwork }} to:</p>
      <h5>{{ subnetwork!.name }}</h5>
    </div>

    <div class="send-subnetwork-select__arrow">
      <switch-arrow />
    </div>
  </a>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import { SubNetworkOptions } from "@/types/base-network";
import { KadenaNetwork } from "@/providers/kadena/types/kadena-network";
import KadenaAPI from "@/providers/kadena/libs/api";

const fromNetwork = ref<string>();

const emit = defineEmits<{
  (e: "update:toggleSubnetworkSelect"): void;
}>();

interface IProps {
  network: KadenaNetwork;
  subnetwork?: SubNetworkOptions | Partial<SubNetworkOptions>;
}

const props = defineProps<IProps>();

onMounted(async () => {
  const networkApi = (await props.network.api()) as KadenaAPI;
  fromNetwork.value = await networkApi.getChainId();
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-subnetwork-select {
  height: 56px;
  background: #ffffff;
  margin: 0 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;

  &__info {
    h5 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      width: 290px;
      margin: 0 0 1px 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @secondaryLabel;
      margin: 0;
      width: 290px;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 4px;
    right: 8px;
    top: 12px;
  }
}
</style>
