<template>
  <app-dialog
    v-model="openDialog"
    width="360px"
    is-centered
    @close:dialog="toggleDialog"
  >
    <div class="deposit">
      <img class="deposit__logo" :src="network.icon" />

      <h2>Your {{ network.name_long }} address</h2>
      <p>
        {{ depositCopy }}
      </p>

      <div v-if="network.name === NetworkNames.Firo">
        <div v-show="!!sparkAccount" class="deposit__tabs">
          <button
            :class="activeTab === 'spark' && 'deposit__tabs-active'"
            @click="setActiveTab('spark')"
          >
            Spark address
          </button>
          <button
            :class="activeTab === 'transparent' && 'deposit__tabs-active'"
            @click="setActiveTab('transparent')"
          >
            Transparent address
          </button>
        </div>

        <div v-if="activeTab === 'transparent'">
          <div class="deposit__code">
            <qrcode-vue
              :value="
                NetworkNames.Firo +
                ':' +
                network.displayAddress(account.address)
              "
              :size="150"
              level="H"
            />
          </div>

          <div class="deposit__account">
            <img
              :src="network.identicon(network.displayAddress(account.address))"
            />

            <div class="deposit__account-info">
              <h4>{{ account.name }}</h4>
              <p>{{ network.displayAddress(account.address) }}</p>
            </div>

            <a
              class="deposit__account-copy"
              @click="copy(network.displayAddress(account.address))"
            >
              <CopyIcon /><span>copy</span>
            </a>

            <notification
              v-if="isCopied"
              :hide="toggleNotification"
              text="Address copied"
              class="deposit__notification"
            />
          </div>
        </div>

        <div v-if="activeTab === 'spark' && !!sparkAccount">
          <div class="deposit__code">
            <qrcode-vue
              :value="NetworkNames.Firo + ':' + sparkAccount?.defaultAddress"
              :size="150"
              level="H"
            />
          </div>

          <div class="deposit__account">
            <div class="deposit__account-info">
              <p class="deposit__account-text">
                {{ sparkAccount?.defaultAddress }}
              </p>
            </div>

            <a
              class="deposit__account-copy"
              @click="copy(sparkAccount?.defaultAddress ?? '')"
            >
              <CopyIcon /><span>copy</span>
            </a>

            <notification
              v-if="isCopied"
              :hide="toggleNotification"
              text="Address copied"
              class="deposit__notification"
            />
          </div>
        </div>
      </div>

      <div v-else>
        <div class="deposit__code">
          <qrcode-vue
            :value="
              $props.network?.provider == ProviderName.kadena
                ? network.displayAddress(account.address)
                : network.provider +
                  ':' +
                  network.displayAddress(account.address)
            "
            :size="150"
            level="H"
          />
        </div>

        <div class="deposit__account">
          <img
            :src="network.identicon(network.displayAddress(account.address))"
          />

          <div class="deposit__account-info">
            <h4>{{ account.name }}</h4>
            <p>{{ network.displayAddress(account.address) }}</p>
          </div>

          <a
            class="deposit__account-copy"
            @click="copy(network.displayAddress(account.address))"
          >
            <CopyIcon /><span>copy</span>
          </a>

          <notification
            v-if="isCopied"
            :hide="toggleNotification"
            text="Address copied"
            class="deposit__notification"
          />
        </div>
      </div>
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from 'vue';
import DomainState from '@/libs/domain-state';
import { BaseNetwork, SubNetworkOptions } from '@/types/base-network';
import { ProviderName } from '@/types/provider';
import Notification from '@action/components/notification/index.vue';
import CopyIcon from '@action/icons/header/copy_icon.vue';
import QrcodeVue from 'qrcode.vue';
import { EnkryptAccount, NetworkNames } from '@enkryptcom/types';
import AppDialog from '@action/components/app-dialog/index.vue';
import { SparkAccount } from '../../types/account';

const isCopied = ref(false);
const activeTab = ref<'transparent' | 'spark'>('spark');
const subNetwork = ref<SubNetworkOptions | null>(null);

const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  account: {
    type: Object as PropType<EnkryptAccount>,
    default: () => {
      return {};
    },
  },
  sparkAccount: {
    type: Object as PropType<SparkAccount | null>,
    default: () => {
      return {};
    },
  },
  showDeposit: {
    type: Boolean,
    default: () => false,
  },
});

const emit = defineEmits<{
  (e: 'toggle:deposit'): void;
}>();

const copy = (address: string) => {
  navigator.clipboard.writeText(address);
  toggleNotification();
};

const toggleNotification = () => {
  isCopied.value = !isCopied.value;
};

const setActiveTab = (value: 'transparent' | 'spark') => {
  activeTab.value = value;
};

onMounted(() => {
  if (props.network.subNetworks) {
    const domainState = new DomainState();
    domainState.getSelectedSubNetWork().then(id => {
      const subnet = props.network.subNetworks?.find(net => net.id === id);
      if (subnet) subNetwork.value = subnet;
    });
  }
});

watch(
  () => props.showDeposit,
  v => {
    if (!v) {
      isCopied.value = false;
      activeTab.value = 'spark';
    }
  },
);

const depositCopy = computed(() => {
  if (subNetwork.value !== null)
    return `You can send ${props.network.currencyNameLong} to this address in ${subNetwork.value.name} using ${props.network.name_long} network.`;
  else
    return `You can send ${props.network.currencyNameLong} to this address using ${props.network.name_long} network.`;
});

/** -------------------
 * Open Close Dialog
 -------------------*/
const openDialog = ref(false);
const toggleDialog = () => {
  emit('toggle:deposit');
};
watch(
  () => props.showDeposit,
  () => {
    openDialog.value = props.showDeposit;
  },
);
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.deposit {
  padding: 20px;

  &.show {
    display: flex;
  }

  &__tabs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 12px;

    &-active {
      border-color: @primaryLabel !important;
    }

    button {
      outline: none;
      border: 1px solid @buttonBg;
      padding: 4px 8px 4px 4px;
      box-sizing: border-box;
      height: 24px;
      background: @buttonBg;
      border-radius: 6px;
      text-decoration: none;
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 16px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: @primaryLabel;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      cursor: pointer;
      transition: opacity 300ms ease-in-out;

      &:hover {
        border-color: @primaryLabel;
      }
    }
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

  &__wrap {
    width: 360px;
    background: @white;
    box-shadow:
      0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    position: relative;
    z-index: 107;
    overflow: hidden;
    padding: 20px;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s,
      visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }

    h2 {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0 0 24px 0;
    }
  }

  &__logo {
    object-fit: contain;
    display: block;
    height: 32px;
    width: 32px;
    margin-bottom: 4px;
  }

  &__code {
    width: 176px;
    height: 176px;
    background: @white;
    box-shadow:
      0px 0.25px 1px rgba(0, 0, 0, 0.039),
      0px 0.85px 3px rgba(0, 0, 0, 0.19);
    border-radius: 16px;
    margin: 0 0 24px 71px;
    padding: 14px;
    box-sizing: border-box;

    img {
      max-width: 148px;
    }
  }

  &__account {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    img {
      max-width: 32px;
      margin-right: 16px;
      border-radius: 100%;
    }

    &-info {
      margin-right: 16px;

      h4 {
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        margin: 0;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: @secondaryLabel;
        margin: 0;
        max-width: 190px;
        word-break: break-all;
      }
    }

    &-text {
      max-width: unset !important;
    }

    &-copy {
      padding: 4px 8px 4px 4px;
      box-sizing: border-box;
      height: 24px;
      display: block;
      background: @buttonBg;
      border-radius: 6px;
      text-decoration: none;
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 16px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: @primaryLabel;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      cursor: pointer;
      transition: opacity 300ms ease-in-out;

      &:hover {
        opacity: 0.8;
      }

      svg {
        max-width: 16px;
        margin-right: 4px;
      }
    }
  }

  &__notification {
    position: absolute;
    left: 117px;
    bottom: 16px;
  }
}
</style>
