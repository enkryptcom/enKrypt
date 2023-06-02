<template>
  <div>
    <div class="add-network__inner-header">
      <a class="add-network__back" @click="back()">
        <arrow-back />
      </a>
      <h3>Custom network</h3>

      <a class="settings__close" @click="close()">
        <close-icon />
      </a>
    </div>

    <div class="add-network__custom-block">
      <label-input
        type="text"
        label="New RPC URL"
        class="add-network__custom-input"
        placeholder="RPC Url"
        :value="rpcURLValue"
        :is-error="rpcInvalid"
        @update:value="rpcURLChanged"
      />
    </div>

    <div class="add-network__custom-block">
      <label-input
        type="text"
        label="Network name"
        class="add-network__custom-input"
        placeholder="Network Name"
        :value="nameValue"
        :is-error="nameInvalid"
        @update:value="nameChanged"
      />
    </div>

    <div class="add-network__custom-block double">
      <label-input
        type="text"
        label="Chain ID"
        class="add-network__custom-input"
        placeholder="0"
        :value="chainIDValue"
        :is-error="chainIDInvalid"
        @update:value="chainIDChanged"
      />

      <label-input
        type="text"
        label="Currency Symbol"
        class="add-network__custom-input"
        placeholder="Symbol"
        :value="symbolValue"
        :is-error="symbolInvalid"
        @update:value="symbolChanged"
      />
    </div>

    <div class="add-network__custom-block">
      <label-input
        type="text"
        label="Block Explorer URL (Optional)"
        class="add-network__custom-input"
        placeholder="Block Explorer URL"
        :value="blockURLValue"
        :is-error="blockURLInvalid"
        @update:value="blockURLChanged"
      />
    </div>

    <div class="add-network__custom-button">
      <base-button
        title="Add network"
        :click="sendAction"
        :disabled="!isValid"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, computed, onMounted } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import ArrowBack from "@action/icons/common/arrow-back.vue";
import LabelInput from "@action/components/label-input/index.vue";
import BaseButton from "@action/components/base-button/index.vue";
import Web3 from "web3-eth";
import { CustomEvmNetworkOptions } from "@/providers/ethereum/types/custom-evm-network";
import { toHex } from "web3-utils";
import CustomNetworksState from "@/libs/custom-networks-state";

interface NetworkConfigItem {
  name: string;
  chain: string;
  rpc: string[];
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  chainId: number;
  networkId: number;
}

const customNetworksState = new CustomNetworksState();

const nameValue = ref<string>("");
const nameInvalid = ref(false);

const rpcURLValue = ref<string>("");
const rpcInvalid = ref(false);
const rpcVerified = ref(false);

const chainIDValue = ref<string>("");
const chainIDInvalid = ref(false);

const symbolValue = ref<string>("");
const symbolInvalid = ref(false);

const blockURLValue = ref<string>("");
const blockURLInvalid = ref(false);

const networkConfigs = ref<NetworkConfigItem[]>([]);

const isValid = computed<boolean>(() => {
  if (nameValue.value?.length < 1 || nameInvalid.value) return false;
  if (rpcURLValue.value?.length < 1 || rpcInvalid.value) return false;
  if (chainIDValue.value?.length < 1 || chainIDInvalid.value) return false;
  if (symbolValue.value?.length < 1 || symbolInvalid.value) return false;
  if (blockURLInvalid.value) return false;

  return true;
});

const props = defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  back: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});

onMounted(() => {
  fetchNetworkConfigs();
});

const fetchNetworkConfigs = async () => {
  const res = await fetch("https://chainid.network/chains.json");
  const data = await res.json();

  networkConfigs.value = data as NetworkConfigItem[];
};

const nameChanged = (newVal: string) => {
  if (newVal.trim().length > 0) {
    nameInvalid.value = false;
  } else {
    nameInvalid.value = true;
  }

  nameValue.value = newVal;
};

const rpcURLChanged = async (newVal: string) => {
  rpcURLValue.value = newVal;

  try {
    new URL(newVal); // Check if value is URL

    const web3 = new Web3(newVal);
    const chainId = await web3.getChainId();

    rpcInvalid.value = false;
    rpcVerified.value = true;

    const networkConfig = networkConfigs.value.find(
      (net) => net.chainId === chainId
    );

    if (networkConfig) {
      symbolValue.value = networkConfig.nativeCurrency.symbol;
      nameValue.value = networkConfig.name;
    }

    chainIDValue.value = chainId.toString();
  } catch {
    rpcInvalid.value = true;
    rpcVerified.value = false;
  }
};
const symbolChanged = (newVal: string) => {
  if (newVal.trim().length > 0) {
    symbolInvalid.value = false;
  } else {
    symbolInvalid.value = true;
  }

  symbolValue.value = newVal;
};
const chainIDChanged = (newVal: string) => {
  if (
    newVal.trim().length < 1 ||
    isNaN(Number(newVal.trim())) ||
    newVal.includes(".")
  ) {
    chainIDInvalid.value = true;
  } else {
    chainIDInvalid.value = false;
  }

  chainIDValue.value = newVal;
};
const blockURLChanged = (newVal: string) => {
  try {
    new URL(newVal);
    blockURLInvalid.value = false;
  } catch {
    if (newVal.trim().length > 0) {
      blockURLInvalid.value = true;
    } else {
      blockURLInvalid.value = false;
    }
  }

  blockURLValue.value = newVal;
};
const sendAction = async () => {
  let blockExplorerAddr: string | undefined;
  let blockExplorerTX: string | undefined;

  if (!blockURLInvalid.value && blockURLValue.value !== "") {
    let blockExplorer = blockURLValue.value;

    if (!blockExplorer.endsWith("/")) {
      blockExplorer = `${blockExplorer}/`;
    }

    blockExplorerAddr = `${blockExplorer}address/[[address]]`;
    blockExplorerTX = `${blockExplorer}tx/[[txHash]]`;
  }

  const customNetworkOptions: CustomEvmNetworkOptions = {
    name: nameValue.value.trim().split(" ").join(""),
    name_long: nameValue.value,
    currencyName: symbolValue.value,
    currencyNameLong: nameValue.value,
    chainID: toHex(chainIDValue.value) as `0x${string}`,
    node: rpcURLValue.value,
    blockExplorerAddr,
    blockExplorerTX,
  };

  await customNetworksState.addCustomNetwork(customNetworkOptions);

  nameValue.value = "";
  symbolValue.value = "";
  chainIDValue.value = "";
  rpcURLValue.value = "";
  blockURLValue.value = "";

  props.back();
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.add-network {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__inner-header {
    width: 100%;
    height: 56px;
    background: @white;
    box-sizing: border-box;
    padding: 14px 56px 14px 56px;
    margin-bottom: 32px;

    h3 {
      font-style: normal;
      font-weight: bold;
      font-size: 20px;
      line-height: 28px;
      margin: 0;
      color: @primaryLabel;
      text-align: center;
    }
  }

  &__back {
    position: absolute;
    top: 8px;
    left: 8px;
    border-radius: 8px;
    cursor: pointer;
    padding: 8px;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__custom {
    &-block {
      padding: 0 32px 16px 32px;

      &.double {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
        .add-network__custom-input {
          margin-right: 6px;

          &:last-child {
            margin-right: 0;
            margin-left: 6px;
          }
        }
      }
    }

    &-button {
      padding: 24px 32px 24px 32px;
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      box-sizing: border-box;
    }
  }
}
</style>
