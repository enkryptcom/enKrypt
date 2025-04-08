<template>
  <div class="add-network__block">
    <div class="add-network__text">
      <img v-if="!props.isCustomNetwork" :src="network.icon" alt="" />
      <custom-network-icon v-else />
      <span>{{ network.name_long }} </span>
      <!-- <test-network-icon v-if="network.isTestNetwork" /> -->
    </div>

    <div class="add-network__action">
      <div class="add-network__link__block" @click="setPinned">
        <tooltip text="Pin Network" is-top-right>
          <div class="add-network__link__block__pin">
            <pin-icon :is-pinned="isPinned" :is-active="true" />
          </div>
        </tooltip>
      </div>
      <tooltip text="Delete Custom Network" is-top-right>
        <div
          v-show="isCustomNetwork"
          class="add-network__delete"
          @click="deleteNetwork"
        >
          <delete-icon />
        </div>
      </tooltip>
      <tooltip text="Enable Network" is-top-right>
        <Switch
          v-if="network.isTestNetwork"
          :is-checked="isActive"
          @update:check="addTestnet"
        />
      </tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import Switch from '@action/components/switch/index.vue';
import deleteIcon from '@/ui/action/icons/actions/trash.vue';
import { NodeType } from '@/types/provider';
import { CustomEvmNetwork } from '@/providers/ethereum/types/custom-evm-network';
import PinIcon from '@action/icons/actions/pin.vue';
import customNetworkIcon from '@/ui/action/icons/common/custom-network-icon.vue';
import { NetworkNames } from '@enkryptcom/types';
import Tooltip from '@/ui/action/components/tooltip/index.vue';

import { trackNetwork } from '@/libs/metrics';
import { NetworkChangeEvents } from '@/libs/metrics/types';

const emit = defineEmits<{
  (e: 'networkToggled', name: string, isActive: boolean): void;
  (e: 'networkDeleted', chainId: string, name: string): void;
  (e: 'update:pinNetwork', network: string, isPinned: boolean): void;
  (e: 'testNetworkToggled', name: NetworkNames, isActive: boolean): void;
}>();

const props = defineProps({
  network: {
    type: Object as PropType<NodeType | CustomEvmNetwork>,
    default: () => {
      return {};
    },
    required: true,
  },
  isActive: Boolean,
  isCustomNetwork: Boolean,
  showTooltip: {
    type: Boolean,
  },
  isPinned: {
    type: Boolean,
    required: true,
  },
});
/**
 * Pin Network
 */

const setPinned = async () => {
  emit('update:pinNetwork', props.network.name, !props.isPinned);
};

/**
 * Delete Custom Network
 */
const deleteNetwork = async () => {
  const chainId = (props.network as unknown as CustomEvmNetwork).chainID;
  if (chainId !== undefined) {
    trackNetwork(NetworkChangeEvents.NetworkDeleteCustomNetwork, {
      customChainId: chainId,
    });
    emit('networkDeleted', chainId, props.network.name);
  }
};

/**
 * Add Testnet
 */
const addTestnet = async (value: boolean) => {
  emit('testNetworkToggled', props.network.name, value);
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
        margin-right: 4px;
        background: transparent;
        border-radius: 24px;
        transition: @opacity-noBG-transition;
        cursor: pointer;
        filter: grayscale(1);
        &:hover {
          background: @primaryLight;
          filter: grayscale(0);
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
      width: 24px;
      height: 24px;
      margin-right: 16px;
    }
    svg {
      width: 24px;
      height: 24px;
      margin-right: 16px;
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
  }

  &__delete {
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;
    width: 16px;
    height: 16px;
    padding: 5px 8px 5px 8px;
    margin-left: -4px;
    background: transparent;
    border-radius: 24px;
    transition: @opacity-noBG-transition;
    cursor: pointer;
    &:hover {
      background: @black007;
    }
  }
}
</style>
