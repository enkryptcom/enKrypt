<template>
  <div class="app">
    <div class="app__menu" :class="classObject">
      <LogoMin :selected="selected" class="app__menu-logo" />
      <AppSearch :is-border="false" />
      <AppMenu
        :networks="networks"
        :selected="selected"
        :set-network="setNetwork"
      />
      <div class="app__menu-footer">
        <a
          class="app__menu-add"
          :class="{ active: $route.name == 'add-network' }"
          @click="addNetwork()"
        >
          <AddIcon />
          Add a network
        </a>

        <div>
          <a class="app__menu-link">
            <HoldIcon />
          </a>

          <a class="app__menu-link">
            <SettingsIcon />
          </a>
        </div>
      </div>
    </div>

    <div class="app__content">
      <NetworkHeader
        v-show="showNetworkMenu"
        :selected="selected"
        :account="account"
      />

      <transition :name="transitionName" mode="out-in">
        <router-view name="view"></router-view>
      </transition>
      <router-view name="modal"></router-view>
      <router-view name="accounts"></router-view>

      <NetworkMenu v-show="showNetworkMenu" :selected="selected" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import AppMenu from "./components/Menu/index.vue";
import NetworkMenu from "./components/NetworkMenu/index.vue";
import NetworkHeader from "./components/NetworkHeader/index.vue";
import AppSearch from "./components/Search/index.vue";
import LogoMin from "./icons/common/logo-min.vue";
import AddIcon from "./icons/common/add-icon.vue";
import SettingsIcon from "./icons/common/settings-icon.vue";
import HoldIcon from "./icons/common/hold-icon.vue";

import { NetworkItem } from "./types/network";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "App",
  components: {
    AppMenu,
    NetworkMenu,
    NetworkHeader,
    AppSearch,
    LogoMin,
    AddIcon,
    SettingsIcon,
    HoldIcon,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    store.dispatch("setNetwork", {
      id: 1,
      title: "Ethereum",
      image: "https://mpolev.ru/enkrypt/eth-logo.png",
    });

    router.push({ name: "activity", params: { id: 1 } });

    return {
      selected: computed(() => store.getters.selected),
      transitionName: computed(() => "fade"),
      account: {
        name: "My Main Account",
        address: "0x03502CF6C0A13167Dc2D0E25Dabf5FBDB68C5968",
        amount: 1.321,
        primaryToken: {
          name: "Ethereum",
          symbol: "eth",
          icon: "https://mpolev.ru/enkrypt/eth.png",
          amount: 0.5,
          price: 2500,
        },
      },
      setNetwork: (network: NetworkItem) => {
        store.dispatch("setNetwork", network);
        router.push({ name: "activity", params: { id: network.id } });
      },
      addNetwork: () => {
        store
          .dispatch("setNetwork", undefined)
          .then(() => router.push({ name: "add-network" }));
      },
    };
  },
  data() {
    return {
      networks: [
        {
          id: 1,
          title: "Ethereum",
          image: "https://mpolev.ru/enkrypt/eth-logo.png",
        },
        {
          id: 2,
          title: "Polygon",
          image: "https://mpolev.ru/enkrypt/polygon-logo.png",
        },
        {
          id: 3,
          title: "Polkadot",
          image: "https://mpolev.ru/enkrypt/polkadot.png",
        },
        {
          id: 4,
          title: "Moonbeam",
          image: "https://mpolev.ru/enkrypt/moonbeam.png",
        },
      ],
    };
  },
  computed: {
    classObject() {
      const store = useStore();
      const selected = store.getters.selected;

      if (selected) {
        return {
          ethereum: selected.id == 1,
          polygon: selected.id == 2,
          polkadot: selected.id == 3,
          moonbeam: selected.id == 4,
        };
      }

      return {};
    },
    showNetworkMenu() {
      const store = useStore();
      const selected = store.getters.selected;

      return (
        !!selected &&
        (this.$route.name == "activity" ||
          this.$route.name == "assets" ||
          this.$route.name == "nfts" ||
          this.$route.name == "dapps")
      );
    },
  },
  created() {
    this.$router.beforeEach((to, from, next) => {
      this.transitionName = "fade";
      next();
    });
  },
});
</script>

<style lang="less">
@import "./theme/theme.less";

body {
  margin: 0;
  padding: 0;
}
.app {
  width: 800px;
  height: 600px;
  overflow: hidden;
  position: relative;

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

    &.ethereum {
      background: @ethereumGradient;
    }

    &.polygon {
      background: @polygonGradient;
    }

    &.polkadot {
      background: @polkadotGradient;
    }

    &.moonbeam {
      background: @moonbeamGradient;
    }

    &-footer {
      position: absolute;
      width: 100%;
      height: 40px;
      bottom: 8px;
      left: 0;
      padding: 0 12px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
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

      &.active,
      &:hover {
        background: @black007;
        border-radius: 10px;
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

      &.active,
      &:hover {
        background: @black007;
        border-radius: 10px;
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
