<template>
  <div class="account">
    <a class="account__info" :class="{ active: active }" @click="showAccounts">
      <img :src="network.identicon(address)" />
      <div class="account__info-name">
        <p>{{ name }}</p>
        <span>{{ $filters.replaceWithEllipsis(address, 6, 4) }}</span>
      </div>
      <switch-arrow />
    </a>

    <div
      v-if="
        network.name == NetworkNames.Kadena ||
        network.name == NetworkNames.KadenaTestnet
      "
      class="chain__info"
      :class="{ active: active }"
      @click="showChains = !showChains"
    >
      <p>{{ chainId }}</p>
      <div class="custom-scrollbar__chain">
        <custom-scrollbar
          class="custom-scrollbar__scroll"
          :class="{ show: showChains }"
          :settings="scrollSettings({ suppressScrollX: true })"
        >
          <chainId-list-item
            v-for="(name, index) in chainIds"
            :key="index"
            :name="name"
            :select="selectChainId"
            :is-checked="name == chainId"
          />
        </custom-scrollbar>
      </div>
    </div>

    <div class="account__actions">
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

      <tooltip text="Account's QR code">
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
import DomainState from "@/libs/domain-state";
import scrollSettings from "@/libs/utils/scroll-settings";
import BtcAccountState from "@/providers/bitcoin/libs/accounts-state";
import EvmAccountState from "@/providers/ethereum/libs/accounts-state";
import KadenaAccountState from "@/providers/kadena/libs/accounts-state";
import SubstrateAccountState from "@/providers/polkadot/libs/accounts-state";
import { BaseNetwork } from "@/types/base-network";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import Notification from "@action/components/notification/index.vue";
import Tooltip from "@action/components/tooltip/index.vue";
import IconCopy from "@action/icons/header/copy_icon.vue";
import IconDisconnect from "@action/icons/header/disconnect_icon.vue";
import IconExternal from "@action/icons/header/external-icon.vue";
import IconQr from "@action/icons/header/qr_icon.vue";
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import { PropType, computed, onMounted, ref } from "vue";
import ChainIdListItem from "./chainId-list-item.vue";
import { chainIds } from "@/providers/kadena/types";
import { NetworkNames } from "@enkryptcom/types";

const isCopied = ref(false);
const domainState = new DomainState();
const isConnectedDomain = ref(false);
const showChains = ref(false);
const chainId = ref("");
const currentDomain = ref("");
const kadenaAccountState = new KadenaAccountState();
const allAccountStates = [
  new EvmAccountState(),
  new BtcAccountState(),
  new SubstrateAccountState(),
  kadenaAccountState,
];

const props = defineProps({
  name: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
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
  (e: "toggle:deposit"): void;
  (e: "chainChanged", chainId: string): void;
}>();

const copy = (address: string) => {
  navigator.clipboard.writeText(address);
  toggleNotification();
};
const showAccounts = () => {
  props.toggleAccounts();
};
const externalLink = computed(() => {
  return props.network.blockExplorerAddr.replace("[[address]]", props.address);
});
const toggleNotification = () => {
  isCopied.value = !isCopied.value;
};
const checkAndSetConnectedDapp = () => {
  Promise.all(
    allAccountStates.map((as) => as.isConnected(currentDomain.value))
  ).then((responses) => {
    responses.forEach((res) => {
      if (res) isConnectedDomain.value = true;
    });
  });
};
const getChainId = async () => {
  chainId.value = await kadenaAccountState.getChainId();
};
const selectChainId = async (chainIdChanged: string) => {
  await kadenaAccountState.setChainId(chainIdChanged);
  chainId.value = chainIdChanged;
  emit("chainChanged", chainIdChanged);
};
onMounted(async () => {
  currentDomain.value = await domainState.getCurrentDomain();
  checkAndSetConnectedDapp();
  await getChainId();
});
const disconnectFromDapp = async () => {
  await Promise.all(
    allAccountStates.map((as) => as.deleteState(currentDomain.value))
  );
  isConnectedDomain.value = false;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

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

    &:hover,
    &.active {
      background: @black007;
    }

    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
      border-radius: 50%;
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

.chain {
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
  box-sizing: border-box;
  background-color: gray;

  &__info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    width: auto;
    color: black;
    text-decoration: none;
    position: relative;
    box-sizing: border-box;
    padding: 6px;
    padding-right: 32px;
    height: 44px;
    cursor: pointer;
    transition: background 300ms ease-in-out;

    &:hover,
    &.active {
      background: @black007;
    }
  }
}

.custom-scrollbar__chain {
  padding-top: 400px !important;
  display: block !important;

  .custom-scrollbar__scroll {
    display: none;
  }

  .show {
    display: block !important;
  }
}
</style>
