<template>
  <div class="app" :class="{ locked: isLocked }">
    <div v-if="isLoading" class="app__loading">
      <swap-looking-animation />
    </div>
    <div v-show="!isLoading" ref="appMenuRef" class="app__menu">
      <logo-min class="app__menu-logo" />
      <base-search
        :value="searchInput"
        :is-border="false"
        @update:value="updateSearchValue"
      />
      <app-menu
        :networks="networks"
        :selected="(route.params.id as string)"
        :search-input="searchInput"
        @update:order="updateNetworkOrder"
        @update:network="setNetwork"
        @update:gradient="updateGradient"
      />
      <div class="app__menu-footer" :class="{ border: networks.length > 9 }">
        <a class="app__menu-add" @click="addNetworkShow = !addNetworkShow">
          <manage-networks-icon />
          Manage networks
        </a>
        <div>
          <a ref="toggle" class="app__menu-link" @click="toggleMoreMenu">
            <more-icon />
          </a>
          <div v-show="isOpenMore" ref="dropdown" class="app__menu-dropdown">
            <a class="app__menu-dropdown-link" @click="lockAction">
              <hold-icon /> <span>Lock Enkrypt</span>
            </a>
            <a class="app__menu-dropdown-link" @click="settingsAction">
              <settings-icon /> <span>Settings</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div v-show="!isLoading" class="app__content">
      <accounts-header
        v-show="showNetworkMenu"
        :account-info="accountHeaderData"
        :network="currentNetwork"
        :show-deposit="showDepositWindow"
        @update:init="init"
        @address-changed="onSelectedAddressChanged"
        @toggle:deposit="toggleDepositWindow"
      />
      <router-view v-slot="{ Component }" name="view">
        <transition :name="transitionName" mode="out-in">
          <component
            :is="Component"
            :key="$route.fullPath"
            :network="currentNetwork"
            :account-info="accountHeaderData"
            @update:init="init"
            @toggle:deposit="toggleDepositWindow"
            @open:buy-action="openBuyPage"
          />
        </transition>
      </router-view>

      <network-menu
        v-show="showNetworkMenu"
        :selected="(route.params.id as string)"
        :network="currentNetwork"
      />
    </div>

    <add-network
      v-show="addNetworkShow"
      @close:popup="addNetworkShow = !addNetworkShow"
      @update:active-networks="setActiveNetworks"
    />

    <settings
      v-if="settingsShow"
      @close:popup="settingsShow = !settingsShow"
      @action:lock="lockAction"
    />
    <modal-rate v-if="rateShow" @close:popup="rateShow = !rateShow" />
    <modal-new-version
      v-if="updateShow"
      :current-version="currentVersion"
      :latest-version="latestVersion"
      @close:popup="updateShow = !updateShow"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppMenu from "./components/app-menu/index.vue";
import NetworkMenu from "./components/network-menu/index.vue";
import AccountsHeader from "./components/accounts-header/index.vue";
import BaseSearch from "./components/base-search/index.vue";
import LogoMin from "./icons/common/logo-min.vue";
import ManageNetworksIcon from "./icons/common/manage-networks-icon.vue";
import SettingsIcon from "./icons/common/settings-icon.vue";
import HoldIcon from "./icons/common/hold-icon.vue";
import MoreIcon from "./icons/actions/more.vue";
import AddNetwork from "./views/add-network/index.vue";
import Settings from "./views/settings/index.vue";
import ModalRate from "./views/modal-rate/index.vue";
import ModalNewVersion from "./views/modal-new-version/index.vue";
import { useRouter, useRoute } from "vue-router";
import { BaseNetwork } from "@/types/base-network";
import {
  DEFAULT_EVM_NETWORK,
  getAllNetworks,
  getNetworkByName,
} from "@/libs/utils/networks";
import DomainState from "@/libs/domain-state";
import {
  getAccountsByNetworkName,
  getOtherSigners,
} from "@/libs/utils/accounts";
import { AccountsHeaderData } from "./types/account";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { sendToBackgroundFromAction } from "@/libs/messenger/extension";
import { MessageMethod } from "@/providers/ethereum/types";
import { InternalMethods } from "@/types/messenger";
import NetworksState from "@/libs/networks-state";
import openOnboard from "@/libs/utils/open-onboard";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { fromBase } from "@enkryptcom/utils";
import { EnkryptAccount } from "@enkryptcom/types";
import Browser from "webextension-polyfill";
import EVMAccountState from "@/providers/ethereum/libs/accounts-state";
import BTCAccountState from "@/providers/bitcoin/libs/accounts-state";
import { ProviderName } from "@/types/provider";
import { onClickOutside } from "@vueuse/core";
import RateState from "@/libs/rate-state";
import SwapLookingAnimation from "@action/icons/swap/swap-looking-animation.vue";
import { addNetworkSelectMetrics } from "@/libs/metrics";
import { getLatestEnkryptVersion } from "@action/utils/browser";
import { gt as semverGT } from "semver";
import { Psbt } from "bitcoinjs-lib";

console.log(
  Psbt.fromHex(
    "70736274ff0100fd690102000000040af91f406f0c1b537b44ee2b62b7d4db80337b1f4f5433088cc7cbec93c066040000000000ffffffff41342c033c2a50eebda24c77948eb7520985004272209ade34503d76d4ad3b0b0700000000ffffffff739eaca121a24581b171c971be4182b6c3542bbba4551d29f4da9d5ecb48c40e0100000000ffffffff495711413f0a20e2b0ddec364a01a9b7698e746a0a4263934e44650eee07aaf70300000000ffffffff06080700000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9102700000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9cf6700000000000017a9140cfa552427d0f2aa49f48b6c1d6b145df276ae8f87580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a99f530c000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a900000000000100fdb10202000000000104495711413f0a20e2b0ddec364a01a9b7698e746a0a4263934e44650eee07aaf70000000000ffffffff495711413f0a20e2b0ddec364a01a9b7698e746a0a4263934e44650eee07aaf70100000000ffffffff05dd65fcdc8cd92c7c20e22274c75d554125e91f08c5d77fc990223b325327560100000000ffffffff495711413f0a20e2b0ddec364a01a9b7698e746a0a4263934e44650eee07aaf70200000000ffffffff04b00400000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9560d01000000000016001473aac1cb8d048c2317f160b4debb6f38bab7d61a1a0400000000000016001473aac1cb8d048c2317f160b4debb6f38bab7d61a02483045022100b259cb4a772c9bd71bc2e3f14742a62f5ed7cf87ef80b710484224bae2ad1f2002200636513cc97dc63b4029a93835432c8aa3b6058d8b4690686530996a14fb362701210301494858c64162cb7d875ad7a5ff4e3bcfd92cf12db9af8fd0d38f96d30df9c80247304402200e5153f19eb7fafef301ef71397adeeb6ae85992f32631fad450401646fee803022076a012a96d7c48ba919dce7580e399b5e9b52b763ff07d7f3863cbc88152a8f101210301494858c64162cb7d875ad7a5ff4e3bcfd92cf12db9af8fd0d38f96d30df9c8014152641f68c827b683c4fd25b580cd556c4b45e29d8534019143e0a2618f31d8ce7ade9cdadaae0d9ac81158f7cfe7361c7c73dc5dba7b54debe305a03eea78e5d830247304402207eedcc73c2cd39d72c9c279bd222e83b67d46788fb8952d624f906f86f7606db02201ceca672946b0d1e1f6b1f83c3fcbc38b6e023f8e068e8850f6ac76d0122160b01210301494858c64162cb7d875ad7a5ff4e3bcfd92cf12db9af8fd0d38f96d30df9c80000000001011fb00400000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a901030401000000000100fdf6010200000000010154983433da19c05c59ce9b2e7395d6cfe130221ee2fd0d66137a4dbac31c1a750100000000ffffffff0b580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a924180e000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a902483045022100ad97dc88cf9bf195c83744c0952dee3056050491df72248d63d911d7a3f0286f02206a22f1b4c1a455d6298d9c98503a37105e14b6c9653b1012d4916fa9be8abdfa01210301494858c64162cb7d875ad7a5ff4e3bcfd92cf12db9af8fd0d38f96d30df9c80000000001011f580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a901030401000000000100fd110302000000000104fecf9f77eb880d391c0877f56b68cf660141a8c42b908690fcee48d20baeca6a040000001716001477db9cb02232a2ec7eb7f85edf8da582fee4640cffffffff15599f273162cb7caa20a2584f7d6bd077e760e904c65269d6657439f372f38f050000001716001477db9cb02232a2ec7eb7f85edf8da582fee4640cffffffff04b107847825265f0903f2cf07a0e00823fec29962716762ac14954d4d705c650100000000ffffffff15599f273162cb7caa20a2584f7d6bd077e760e904c65269d6657439f372f38f060000001716001477db9cb02232a2ec7eb7f85edf8da582fee4640cffffffff07b00400000000000017a9140cfa552427d0f2aa49f48b6c1d6b145df276ae8f87102700000000000022512047a57ff5c5c6dc3d70a9b9d46fb0d2d4da883b0315ebd6e87aac9defc7d3fb6452990000000000002251203a5da81e302a9d32ef6a5a90cd82fe57dee5a6d01a851cc5845d8ec225b8c8aeee020000000000002251208956d10dad2520e1c13524385b1f5e51e33b83d4afe69bc951e52b1ef943d3dd580200000000000017a9140cfa552427d0f2aa49f48b6c1d6b145df276ae8f87580200000000000017a9140cfa552427d0f2aa49f48b6c1d6b145df276ae8f87302400000000000017a9140cfa552427d0f2aa49f48b6c1d6b145df276ae8f8702483045022100d3d04d24dd2cb21cbfd709eccf8ec57c66bbaa805b95be13ec9481465f898df102202e3e95212773703608e03ccbac8e95dbea9de9d81f11fd985fe8231cd41d20c4012102cf590ac1a167a293177ec6b8199c281073086a86727c86aacfb2ccda80d358af00014158b81fc9352b7de5691c2d93e28d2346e9b2bc2ed7f1a2add10e77ad86b77b494dd99f1857aa8d70348f6df192d99f850f6b44f8feea6afd6cd05ac77fefa737830247304402203e789fd09cc8447b1c0c87861fc7455751e684b86e1c1684e126d53e33e222c002206dd4c9b695366cb05634e9d750c0267beb19ff84f843a6e667fcb96a2afa3c09012102cf590ac1a167a293177ec6b8199c281073086a86727c86aacfb2ccda80d358af0000000001012b102700000000000022512047a57ff5c5c6dc3d70a9b9d46fb0d2d4da883b0315ebd6e87aac9defc7d3fb6401030401000000000100fd1c010200000000010141342c033c2a50eebda24c77948eb7520985004272209ade34503d76d4ad3b0b0a00000000ffffffff04580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9580200000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9d02a01000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a9f4db0c000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a90247304402207b6ff5ed080050fc9d57a688eea577c2b60410e57feb58c3376c324eaf1f687d02206297ce7ab776b1022ab979dd2a0d95039947ebaf654f3f78617ad85ac298d08e01210301494858c64162cb7d875ad7a5ff4e3bcfd92cf12db9af8fd0d38f96d30df9c80000000001011ff4db0c000000000016001435f5695829b38d9a33b20135a60da6b6fd8b30a90103040100000000000000000000"
  )
);

const domainState = new DomainState();
const networksState = new NetworksState();
const rateState = new RateState();
const appMenuRef = ref(null);
const showDepositWindow = ref(false);
const accountHeaderData = ref<AccountsHeaderData>({
  activeAccounts: [],
  inactiveAccounts: [],
  selectedAccount: null,
  activeBalances: [],
});
const isOpenMore = ref(false);
let timeout: ReturnType<typeof setTimeout> | null = null;
defineExpose({ appMenuRef });
const router = useRouter();
const route = useRoute();
const transitionName = "fade";
const searchInput = ref("");
const networks = ref<BaseNetwork[]>([]);
const defaultNetwork = DEFAULT_EVM_NETWORK;
const currentNetwork = ref<BaseNetwork>(defaultNetwork);
const kr = new PublicKeyRing();
const addNetworkShow = ref(false);
const settingsShow = ref(false);
const rateShow = ref(false);
const updateShow = ref(false);
const dropdown = ref(null);
const toggle = ref(null);
const isLoading = ref(true);
const currentVersion = process.env.PACKAGE_VERSION as string;
const latestVersion = ref("");

const setActiveNetworks = async () => {
  const activeNetworkNames = await networksState.getActiveNetworkNames();

  const allNetworks = await getAllNetworks();
  const networksToShow: BaseNetwork[] = [];

  activeNetworkNames.forEach((name) => {
    const network = allNetworks.find((network) => network.name === name);
    if (network !== undefined) networksToShow.push(network);
  });
  networks.value = networksToShow;

  if (!networks.value.includes(currentNetwork.value)) {
    setNetwork(networks.value[0]);
  }
};
const updateNetworkOrder = (newOrder: BaseNetwork[]) => {
  if (searchInput.value === "") networks.value = newOrder;
};
const updateSearchValue = (newval: string) => {
  searchInput.value = newval;
};
const toggleDepositWindow = () => {
  showDepositWindow.value = !showDepositWindow.value;
};
const openBuyPage = () => {
  Browser.tabs.create({
    url: `https://ccswap.myetherwallet.com/?to=${currentNetwork.value.displayAddress(
      accountHeaderData.value.selectedAccount!.address
    )}&platform=enkrypt`,
  });
};
const isKeyRingLocked = async (): Promise<boolean> => {
  return await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.isLocked,
      params: [],
    }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  }).then((res) => JSON.parse(res.result || "true"));
};
const init = async () => {
  const curNetwork = await domainState.getSelectedNetWork();
  if (curNetwork) {
    const savedNetwork = await getNetworkByName(curNetwork);
    if (savedNetwork) setNetwork(savedNetwork);
    else setNetwork(defaultNetwork);
  } else {
    setNetwork(defaultNetwork);
  }
  await setActiveNetworks();
  isLoading.value = false;
};
onMounted(async () => {
  const isInitialized = await kr.isInitialized();
  if (isInitialized) {
    const _isLocked = await isKeyRingLocked();
    if (_isLocked) {
      router
        .push({ name: "lock-screen" })
        .then(() => (isLoading.value = false));
    } else {
      init();
      setTimeout(() => {
        rateState.showPopup().then((show) => {
          if (show) {
            rateShow.value = true;
          } else {
            getLatestEnkryptVersion().then((version) => {
              if (
                currentVersion &&
                version &&
                semverGT(version, currentVersion)
              ) {
                latestVersion.value = version;
                updateShow.value = true;
              }
            });
          }
        });
      }, 2000);
    }
  } else {
    openOnboard();
  }
});
const updateGradient = (newGradient: string) => {
  //hack may be there is a better way. less.modifyVars doesnt work
  if (appMenuRef.value)
    (
      appMenuRef.value as HTMLElement
    ).style.background = `radial-gradient(137.35% 97% at 100% 50%, rgba(250, 250, 250, 0.94) 0%, rgba(250, 250, 250, 0.96) 28.91%, rgba(250, 250, 250, 0.98) 100%), linear-gradient(180deg, ${newGradient} 80%, #684CFF 100%)`;
};
const setNetwork = async (network: BaseNetwork) => {
  addNetworkSelectMetrics(network.provider, network.name, 1);
  const activeAccounts = await getAccountsByNetworkName(network.name);

  const inactiveAccounts = await kr.getAccounts(
    getOtherSigners(network.signer)
  );
  const selectedAddress = await domainState.getSelectedAddress();
  let selectedAccount = activeAccounts[0];
  if (selectedAddress) {
    const found = activeAccounts.find((acc) => acc.address === selectedAddress);
    if (found) selectedAccount = found;
  }
  accountHeaderData.value = {
    activeAccounts,
    inactiveAccounts,
    selectedAccount,
    activeBalances: activeAccounts.map(() => "~"),
  };
  currentNetwork.value = network;
  router.push({ name: "assets", params: { id: network.name } });
  const tabId = await domainState.getCurrentTabId();
  const curSavedNetwork = await domainState.getSelectedNetWork();
  if (
    curSavedNetwork !== network.name &&
    (currentNetwork.value as EvmNetwork).chainID
  ) {
    await sendToBackgroundFromAction({
      message: JSON.stringify({
        method: InternalMethods.changeNetwork,
        params: [currentNetwork.value.name],
      }),
      provider: currentNetwork.value.provider,
      tabId,
    });
    await sendToBackgroundFromAction({
      message: JSON.stringify({
        method: InternalMethods.sendToTab,
        params: [
          {
            method: MessageMethod.changeChainId,
            params: [(currentNetwork.value as EvmNetwork).chainID],
          },
        ],
      }),
      provider: currentNetwork.value.provider,
      tabId,
    });
  }
  domainState.setSelectedNetwork(network.name);
  if (network.api) {
    try {
      const thisNetworkName = currentNetwork.value.name;
      const api = await network.api();
      const activeBalancePromises = activeAccounts.map((acc) =>
        api.getBalance(acc.address)
      );
      Promise.all(activeBalancePromises).then((balances) => {
        if (thisNetworkName === currentNetwork.value.name)
          accountHeaderData.value.activeBalances = balances.map((bal) =>
            fromBase(bal, network.decimals)
          );
      });
    } catch (e) {
      console.error(e);
    }
  }
};

const onSelectedAddressChanged = async (newAccount: EnkryptAccount) => {
  accountHeaderData.value.selectedAccount = newAccount;
  if (
    currentNetwork.value.provider === ProviderName.ethereum ||
    currentNetwork.value.provider === ProviderName.bitcoin
  ) {
    const AccountState =
      currentNetwork.value.provider === ProviderName.ethereum
        ? new EVMAccountState()
        : new BTCAccountState();
    const domain = await domainState.getCurrentDomain();
    AccountState.addApprovedAddress(newAccount.address, domain);
  }
  await domainState.setSelectedAddress(newAccount.address);
  await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.sendToTab,
      params: [
        {
          method: MessageMethod.changeAddress,
          params: [currentNetwork.value.displayAddress(newAccount.address)],
        },
      ],
    }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  });
};
const showNetworkMenu = computed(() => {
  const selected = route.params.id as string;
  return (
    !!selected &&
    (route.name == "activity" ||
      route.name == "assets" ||
      route.name == "nfts" ||
      route.name == "dapps")
  );
});
const isLocked = computed(() => {
  return route.name == "lock-screen";
});

const lockAction = async () => {
  sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.lock,
    }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  });
  router.push({ name: "lock-screen" });
};
const settingsAction = () => {
  closeMoreMenu();
  settingsShow.value = !settingsShow.value;
};
const toggleMoreMenu = () => {
  if (timeout != null) {
    clearTimeout(timeout);

    timeout = null;
  }
  if (isOpenMore.value) {
    closeMoreMenu();
  } else {
    isOpenMore.value = true;
  }
};
const closeMoreMenu = () => {
  if (timeout != null) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    isOpenMore.value = false;
  }, 50);
};
onClickOutside(
  dropdown,
  () => {
    closeMoreMenu();
  },
  { ignore: [toggle] }
);
</script>

<style lang="less">
@import "./styles/theme.less";
@import (css)
  url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap");

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: "Roboto", sans-serif;
}
.app {
  width: 800px;
  height: 600px;
  overflow: hidden;
  position: relative;
  -webkit-transition: width 0.3s ease-in, height 0.3s ease-in;
  -moz-transition: width 0.3s ease-in, height 0.3s ease-in;
  -ms-transition: width 0.3s ease-in, height 0.3s ease-in;
  -o-transition: width 0.3s ease-in, height 0.3s ease-in;
  transition: width 0.3s ease-in, height 0.3s ease-in;

  &__loading {
    width: 800px;
    height: 600px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: relative;
    background: radial-gradient(
        100% 50% at 100% 50%,
        rgba(250, 250, 250, 0.92) 0%,
        rgba(250, 250, 250, 0.98) 100%
      )
      @primary;

    svg {
      width: 132px;
      position: relative;
      z-index: 2;
    }
  }
  &__menu {
    width: 340px;
    height: 600px;
    position: absolute;
    left: 0;
    top: 0;
    padding: 16px 12px 8px 12px;
    box-sizing: border-box;
    z-index: 1;
    background: @defaultGradient;

    &-logo {
      margin-left: 8px;
    }

    &-footer {
      position: absolute;
      width: 100%;
      height: 56px;
      bottom: 0;
      left: 0;
      padding: 0 12px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
      background: rgba(255, 255, 255, 0.01);

      &.border {
        box-shadow: 0px 0px 6px -1px rgba(0, 0, 0, 0.05),
          0px 0px 1px rgba(0, 0, 0, 0.2);
      }
    }

    &-add {
      display: flex;
      box-sizing: border-box;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
      height: 40px;
      padding: 10px 16px 10px 8px;
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      text-decoration: none;
      cursor: pointer;
      border-radius: 10px;
      transition: background 300ms ease-in-out;

      &.active,
      &:hover {
        background: @black007;
      }

      svg {
        margin-right: 8px;
      }
    }

    &-link {
      display: inline-block;
      padding: 8px;
      margin-left: 4px;
      text-decoration: none;
      cursor: pointer;
      font-size: 0;
      border-radius: 10px;
      transition: background 300ms ease-in-out;

      &.active,
      &:hover {
        background: @black007;
      }
    }

    &-dropdown {
      padding: 8px;
      position: relative;
      width: 172px;
      background: @white;
      box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
        0px 3.75px 11px rgba(0, 0, 0, 0.19);
      border-radius: 12px;
      position: absolute;
      right: 8px;
      bottom: 52px;

      &-link {
        width: 100%;
        height: 48px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
        cursor: pointer;
        transition: background 300ms ease-in-out;
        border-radius: 8px;

        &:hover,
        &.active {
          background: rgba(0, 0, 0, 0.04);
        }

        svg {
          margin-right: 12px;
          margin-left: 12px;
        }

        span {
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.25px;
          color: @primaryLabel;
        }
      }
    }
  }

  &__content {
    width: 460px;
    height: 600px;
    position: relative;
    padding-left: 340px;
  }
}
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.3s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}
.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(2em, 0);
}
.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-2em, 0);
}
</style>
