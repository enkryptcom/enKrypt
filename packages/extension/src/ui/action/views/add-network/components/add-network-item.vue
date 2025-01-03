<template>
  <div class="add-network__block">
    <div class="add-network__text">
      <img v-if="!props.isCustomNetwork" :src="network.icon" alt="" />
      <custom-network-icon v-else />
      <span>{{ network.name_long }} </span>
      <!-- <test-network-icon v-if="network.isTestNetwork" /> -->
    </div>

    <div class="add-network__action">
      <!-- <a href="#">
        <InfoIcon />
      </a> -->
      <a
        v-show="isCustomNetwork"
        class="add-network__close"
        @click="editNetwork"
      >
        <edit-icon />
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
              'add-network__link__block__pin__active': isHovered,
            },
          ]"
        >
          <pin-icon :is-pinned="isPinned" :is-active="pinIconIsActive" />
        </p>
      </div>
      <Switch
        v-if="network.isTestNetwork"
        :is-checked="isActive"
        @update:check="addTestnet"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, ref } from 'vue';
import Switch from '@action/components/switch/index.vue';
import editIcon from '@/ui/action/icons/actions/edit.vue';
import { NodeType } from '@/types/provider';
import { CustomEvmNetwork } from '@/providers/ethereum/types/custom-evm-network';
import PinIcon from '@action/icons/actions/pin.vue';
import customNetworkIcon from '@/ui/action/icons/common/custom-network-icon.vue';
import { NetworkNames } from '@enkryptcom/types';

const isHovered = ref(false);

const emit = defineEmits<{
  (e: 'networkToggled', name: string, isActive: boolean): void;
  (e: 'networkDeleted', chainId: string): void;
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
const pinIconIsActive = computed(() => {
  return props.isPinned || isHovered.value;
});

const setPinned = async () => {
  emit('update:pinNetwork', props.network.name, !props.isPinned);
};

/**
 * Edit Custom Network
 */
const editNetwork = async () => {
  const chainId = (props.network as unknown as CustomEvmNetwork).chainID;

  if (chainId !== undefined) {
    emit('networkDeleted', chainId);
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
    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: @black007;
    }
  }
}
</style>
