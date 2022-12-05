<template>
  <div class="add-network__block">
    <div class="add-network__text">
      <img :src="network.icon" alt="" />
      <span>{{ network.name_long }}</span>
    </div>

    <div class="add-network__action">
      <!-- <a href="#">
        <InfoIcon />
      </a> -->
      <a
        v-show="isCustomNetwork"
        class="add-network__close"
        @click="() => deleteNetwork()"
      >
        <close-icon />
      </a>
      <Switch :is-checked="isActive" @update:check="check" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import Switch from "@action/components/switch/index.vue";
// import InfoIcon from "@action/icons/common/info-icon.vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import { NodeType } from "@/types/provider";
import { CustomEvmNetwork } from "@/providers/ethereum/types/custom-evm-network";

const emit = defineEmits<{
  (e: "networkToggled", name: string, isActive: boolean): void;
  (e: "networkDeleted", chainId: string): void;
}>();

const props = defineProps({
  network: {
    type: Object as PropType<NodeType>,
    default: () => {
      return {};
    },
  },
  isActive: Boolean,
  isCustomNetwork: Boolean,
});

const check = async (isChecked: boolean) => {
  emit("networkToggled", props.network.name, isChecked);
};

const deleteNetwork = async () => {
  const chainId = (props.network as unknown as CustomEvmNetwork).chainID;

  if (chainId !== undefined) {
    emit("networkDeleted", chainId);
  }
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.add-network {
  &__block {
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    height: 44px;
  }

  &__text {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    img {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }

    span {
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
    }
  }

  &__action {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    a {
      display: inline-block;
      font-size: 0;
      margin-right: 10px;
    }
  }

  &__close {
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }
}
</style>
