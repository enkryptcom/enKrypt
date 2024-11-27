<template>
  <div class="add-network__block">
    <div class="add-network__text">
      <img v-if="!props.isCustomNetwork" :src="network.icon" alt="" />
      <custom-network-icon v-else />
      <span>{{ network.name_long }} </span>
      <test-network-icon v-if="network.isTestNetwork" />
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
      <div
        class="add-network__link__block"
        @mouseover="isHovered = true"
        @mouseleave="isHovered = false"
        @click="setPinned"
      >
        <p
          :class="[
            'add-network__link__block__pin',
            {
              'add-network__link__block__pin__active': pinIconIsActive,
            },
          ]"
        >
          <pin-icon :is-pinned="isActive" :is-active="pinIconIsActive" />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, ref } from 'vue';
import Switch from '@action/components/switch/index.vue';
// import InfoIcon from "@action/icons/common/info-icon.vue";
import CloseIcon from '@action/icons/common/close-icon.vue';
import { NodeType } from '@/types/provider';
import { CustomEvmNetwork } from '@/providers/ethereum/types/custom-evm-network';
import TestNetworkIcon from '@action/icons/common/test-network-icon.vue';
import Tooltip from '@/ui/action/components/tooltip/index.vue';
import PinIcon from '@action/icons/actions/pin.vue';
import customNetworkIcon from '@/ui/action/icons/common/custom-network-icon.vue';

const isHovered = ref(false);

const emit = defineEmits<{
  (e: 'networkToggled', name: string, isActive: boolean): void;
  (e: 'networkDeleted', chainId: string): void;
  (e: 'update:pinNetwork', network: string, isPinned: boolean): void;
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
  showTooltip: {
    type: Boolean,
  },
});

const check = async (isChecked: boolean) => {
  emit('networkToggled', props.network.name, isChecked);
};
const pinIconIsActive = computed(() => {
  return props.isActive || isHovered.value;
});

const setPinned = async () => {
  emit('update:pinNetwork', props.network.name, !props.isActive);
};

const deleteNetwork = async () => {
  const chainId = (props.network as unknown as CustomEvmNetwork).chainID;

  if (chainId !== undefined) {
    emit('networkDeleted', chainId);
  }
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.add-network {
  &__link {
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    justify-self: center;
    align-items: center;
    flex-direction: row;
    width: 96%;
    min-height: 40px !important;
    max-height: 40px;
    margin-bottom: 3px;
    margin-top: 3px;
    cursor: pointer;
    position: relative;
    border-radius: 10px;
    padding-right: 8px;
    &__block {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      gap: 4px;
      &__pin {
        max-width: 32px;
        max-height: 24px;
        padding: 5px 8px 3px 8px;
        background: transparent;
        border-radius: 24px;
        transition: @opacity-noBG-transition;
        cursor: pointer;
        &__active {
          background: @primaryLight;
        }
      }
    }

    img {
      width: 24px;
      height: 24px;
      margin: 0 8px;
      border-radius: 50%;
    }

    span {
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
    }

    &.active {
      background: @white09;
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.16);
      span {
        font-weight: 500;
      }
      &:hover {
        background: @white09;
      }
    }
  }
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
    svg {
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
