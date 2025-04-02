<template>
  <div class="account">
    <a class="account__info" :class="{ active: active }" @click="showAccounts">
      <div class="account__info-images">
        <img
          :src="network.identicon(address)"
          class="account__info-images__identicon"
        />
        <img
          :src="network.icon"
          :alt="`Active network: ${network.name}`"
          class="account__info-images__active-network"
        />
      </div>

      <div class="account__info-name">
        <p>{{ name }}</p>
        <span>{{ $filters.replaceWithEllipsis(address, 6, 4) }}</span>
      </div>
      <switch-arrow />
    </a>

    <div class="account__actions">
      <div
        v-if="network.subNetworks"
        class="account__info"
        :class="{ active: showChains }"
        @click="showChains = !showChains"
      >
        <div class="account__info-name">
          <p>{{ currentSubNetwork.name }}</p>
        </div>

        <subnet-list
          :sub-nets="network.subNetworks"
          :selected-id="currentSubNetwork.id"
          :show-chains="showChains"
          v-bind="$attrs"
          @select:subnetwork="setSubNetwork"
        />
        <switch-arrow />
      </div>
      <notification
        v-if="isCopied"
        :hide="toggleNotification"
        text="Address copied"
        class="account__notification"
      />

      <tooltip v-if="isConnectedDomain" text="Disconnect from current dapp">
        <a class="account__actions--copy" @click="disconnectFromDapp()">
          <icon-disconnect />
        </a>
      </tooltip>

      <tooltip text="View on Blockchain Explorer">
        <a class="account__actions--copy" target="_blank" :href="externalLink">
          <icon-external />
        </a>
      </tooltip>

      <tooltip text="Copy address">
        <a class="account__actions--copy" @click="copy(address)">
          <icon-copy />
        </a>
      </tooltip>

      <tooltip text="Account's QR code" is-bottom-right>
        <a
          showDeposit
          class="account__actions--copy"
          @click="$emit('toggle:deposit')"
        >
          <icon-qr />
        </a>
      </tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import DomainState from '@/libs/domain-state';
import BtcAccountState from '@/providers/bitcoin/libs/accounts-state';
import EvmAccountState from '@/providers/ethereum/libs/accounts-state';
import KadenaAccountState from '@/providers/kadena/libs/accounts-state';
import SolanaAccountState from '@/providers/solana/libs/accounts-state';
import SubstrateAccountState from '@/providers/polkadot/libs/accounts-state';
import { BaseNetwork, SubNetworkOptions } from '@/types/base-network';
import Notification from '@action/components/notification/index.vue';
import Tooltip from '@action/components/tooltip/index.vue';
import IconCopy from '@action/icons/header/copy_icon.vue';
import IconDisconnect from '@action/icons/header/disconnect_icon.vue';
import IconExternal from '@action/icons/header/external-icon.vue';
import IconQr from '@action/icons/header/qr_icon.vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import { PropType, computed, onMounted, ref, watch } from 'vue';
import SubnetList from './subnet-list.vue';

const isCopied = ref(false);
const domainState = new DomainState();
const isConnectedDomain = ref(false);
const showChains = ref(false);
const currentSubNetwork = ref<SubNetworkOptions>({
  id: '',
  name: '',
});
const currentDomain = ref('');
const kadenaAccountState = new KadenaAccountState();
const allAccountStates = [
  new EvmAccountState(),
  new BtcAccountState(),
  new SolanaAccountState(),
  new SubstrateAccountState(),
  kadenaAccountState,
];

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  active: Boolean,
  toggleAccounts: {
    type: Function,
    default: () => ({}),
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});
const emit = defineEmits<{
  (e: 'toggle:deposit'): void;
  (e: 'select:subnetwork', id: string): void;
}>();

const copy = (address: string) => {
  navigator.clipboard.writeText(address);
  toggleNotification();
};
const showAccounts = () => {
  props.toggleAccounts();
};
const externalLink = computed(() => {
  return props.network.blockExplorerAddr.replace('[[address]]', props.address);
});
const toggleNotification = () => {
  isCopied.value = !isCopied.value;
};
const checkAndSetConnectedDapp = () => {
  Promise.all(
    allAccountStates.map(as => as.isConnected(currentDomain.value)),
  ).then(responses => {
    responses.forEach(res => {
      if (res) isConnectedDomain.value = true;
    });
  });
};
const checkAndSetSubNetwork = () => {
  if (props.network.subNetworks) {
    domainState.getSelectedSubNetWork().then(id => {
      if (id) {
        const subnet = props.network.subNetworks!.find(net => net.id === id);
        if (subnet) currentSubNetwork.value = subnet;
      } else {
        currentSubNetwork.value = props.network.subNetworks![0];
      }
      setSubNetwork(currentSubNetwork.value.id);
    });
  }
};

const setSubNetwork = async (id: string) => {
  const subnet = props.network.subNetworks!.find(net => net.id === id);
  if (subnet) currentSubNetwork.value = subnet;
  emit('select:subnetwork', id);
  setTimeout(() => {
    showChains.value = false;
  }, 100);
};

onMounted(async () => {
  currentDomain.value = await domainState.getCurrentDomain();
  checkAndSetConnectedDapp();
  checkAndSetSubNetwork();
});
watch(() => props.network, checkAndSetSubNetwork);
const disconnectFromDapp = async () => {
  await Promise.all(
    allAccountStates.map(as => as.deleteState(currentDomain.value)),
  );
  isConnectedDomain.value = false;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.account {
  border-radius: 12px;
  width: 100%;
  height: 56px;
  display: block;
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  position: relative;
  z-index: 104;
  padding: 6px;
  box-sizing: border-box;

  &__info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    width: auto;
    text-decoration: none;
    position: relative;
    box-sizing: border-box;
    padding: 6px;
    padding-right: 32px;
    border-radius: 10px;
    height: 44px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    &-images {
      position: relative;
      &__identicon {
        width: 32px;
        height: 32px;
        margin-right: 12px;
        border-radius: 50%;
        margin-top: 2px;
      }
      &__active-network {
        position: absolute;
        top: -4px;
        left: -4px;
        height: 15px;
        width: 15px;
        background: @white;
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.16);
        padding: 1px;
        border-radius: 50%;
        object-fit: contain;
      }
    }

    &:hover,
    &.active {
      background: @black007;
    }

    &-name {
      p {
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        margin: 0;
        white-space: nowrap;
        -ms-text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        overflow: hidden;
        -ms-line-clamp: 1;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        max-width: 230px;
      }

      span {
        display: block;
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        color: @secondaryLabel;
        letter-spacing: 0.5px;
      }
    }

    svg {
      position: absolute;
      top: 10px;
      right: 4px;
    }
  }

  &__actions {
    height: 100%;
    width: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    text-decoration: none;
    font-size: 0;
    padding-left: 4px;
    padding-right: 4px;
    box-sizing: border-box;

    a {
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      cursor: pointer;
      transition: background 300ms ease-in-out;

      &:hover {
        background: @black007;
      }
    }
  }

  &__notification {
    position: absolute;
    right: 8px;
    top: 52px;
    z-index: 141;
  }
}
</style>
