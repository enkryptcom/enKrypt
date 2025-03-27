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

      <div class="deposit__code">
        <qrcode-vue
          :value="
            $props.network?.provider == ProviderName.kadena
              ? network.displayAddress(account.address)
              : network.provider + ':' + network.displayAddress(account.address)
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
  </app-dialog>
</template>

<script setup lang="ts">
import { PropType, ref, onMounted, computed, watch } from 'vue';
import CopyIcon from '@action/icons/header/copy_icon.vue';
import QrcodeVue from 'qrcode.vue';
import { EnkryptAccount } from '@enkryptcom/types';
import Notification from '@action/components/notification/index.vue';
import { ProviderName } from '@/types/provider';
import { BaseNetwork, SubNetworkOptions } from '@/types/base-network';
import DomainState from '@/libs/domain-state';
import AppDialog from '@action/components/app-dialog/index.vue';

const isCopied = ref(false);
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

onMounted(() => {
  if (props.network.subNetworks) {
    const domainState = new DomainState();
    domainState.getSelectedSubNetWork().then(id => {
      const subnet = props.network.subNetworks?.find(net => net.id === id);
      if (subnet) subNetwork.value = subnet;
    });
  }
});

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
    justify-content: flex-start;
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
