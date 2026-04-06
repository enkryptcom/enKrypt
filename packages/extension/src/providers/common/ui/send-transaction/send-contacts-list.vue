<template>
  <div class="send-contacts-list" :class="{ show: showAccounts }">
    <div class="send-contacts-list__overlay" @click="close" />
    <div
      class="send-contacts-list__wrap"
      :class="{ show: showAccounts, header: isMyAddress }"
    >
      <custom-scrollbar
        class="send-contacts-list__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
      >
        <div
          v-if="recentlySentAddresses && !isMyAddress"
          class="send-contacts-list__block"
        >
          <div class="send-contacts-list__buttons">
            <base-button title="Send to my address" :click="sendToMyAddress" />

            <a
              class="send-contacts-list__buttons-paste"
              @click="pasteFromClipboard"
            >
              <paste-icon /> Paste
            </a>
          </div>
          <template v-if="recentlySentAddresses.length">
            <h3>Recent</h3>
            <div class="send-contacts-list__list">
              <send-address-item
                v-for="(recentAddress, index) in recentlySentAddresses"
                :key="index"
                :account="{
                  address: recentAddress,
                  name: accountInfo.activeAccounts.find(
                    account =>
                      network.displayAddress(account.address) ===
                      network.displayAddress(recentAddress),
                  )?.name,
                }"
                :network="network"
                v-bind="$attrs"
                :is-checked="isChecked(recentAddress)"
              />
            </div>
          </template>
          <h3>My accounts</h3>
          <div class="send-contacts-list__list">
            <send-address-item
              v-for="(account, index) in accountInfo.activeAccounts"
              :key="index"
              :account="account"
              :network="network"
              v-bind="$attrs"
              :is-checked="isChecked(account.address)"
            />
          </div>
        </div>
        <div v-if="isMyAddress" class="send-contacts-list__block">
          <div class="send-contacts-list__block-header">
            <a class="send-contacts-list__block-back" @click="back()">
              <arrow-back />
            </a>
            <h4>My accounts</h4>
          </div>
          <div class="send-contacts-list__list">
            <send-address-item
              v-for="(account, index) in accountInfo.activeAccounts"
              :key="index"
              :account="account"
              :network="network"
              v-bind="$attrs"
              :is-checked="isChecked(account.address)"
            />
          </div>
        </div>
      </custom-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref } from 'vue';
import SendAddressItem from './send-address-item.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import BaseButton from '@action/components/base-button/index.vue';
import { AccountsHeaderData } from '@action/types/account';
import scrollSettings from '@/libs/utils/scroll-settings';
import { BaseNetwork } from '@/types/base-network';
import PasteIcon from '@action/icons/actions/paste.vue';
import ArrowBack from '@action/icons/common/arrow-back.vue';
import RecentlySentAddressesState from '@/libs/recently-sent-addresses';

const emit = defineEmits<{
  (e: 'update:pasteFromClipboard'): void;
  (e: 'close', open: false): void;
}>();

const isMyAddress = ref(false);

const props = defineProps({
  showAccounts: Boolean,
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  address: {
    type: String,
    default: '',
  },
});

const recentlySentAddressesState = new RecentlySentAddressesState();

const recentlySentAddresses = ref<null | string[]>(null);

const isChecked = (address: string) => {
  try {
    return (
      !!props.address &&
      props.network.displayAddress(props.address) ===
        props.network.displayAddress(address)
    );
  } catch {
    console.error(
      'Error checking if address is checked, probably name resolver',
    );
    return false;
  }
};

onMounted(async function () {
  let timedOut = false;
  const timeout = setTimeout(function () {
    console.error('Timed out getting recently sent addresses');
    recentlySentAddresses.value = [];
    timedOut = true;
  }, 500);
  try {
    const addresses = await recentlySentAddressesState.getRecentlySentAddresses(
      props.network.name,
    );
    if (!timedOut) {
      recentlySentAddresses.value = Array.from(
        new Set(
          addresses.map(address => props.network.displayAddress(address)),
        ),
      );
    }
  } catch (err) {
    console.error('Error getting recently sent addresses', err);
    recentlySentAddresses.value = [];
  } finally {
    clearTimeout(timeout);
  }
});

const close = () => {
  emit('close', false);
};

const sendToMyAddress = () => {
  isMyAddress.value = true;
};

const back = () => {
  isMyAddress.value = false;
};

const pasteFromClipboard = () => {
  emit('update:pasteFromClipboard');
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-contacts-list {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 101;
  display: none;

  &.show {
    display: block;
  }

  &__overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 102;
  }

  &__wrap {
    position: absolute;
    width: calc(100% - 48px);
    height: auto;
    max-height: 530px;
    left: 24px;
    top: 221px;
    background: @white;
    box-shadow:
      0px 8px 24px rgba(0, 0, 0, 0.12),
      0px 2px 8px rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    z-index: 103;
    overflow: hidden;
    padding: 16px 0 8px 0;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 200ms ease-out,
      transform 200ms ease-out,
      visibility 0s ease-in-out 200ms;
    transform: translateY(-8px);

    &.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      transition-delay: 0s;
    }

    &.header {
      padding: 0 0 8px 0;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 330px;
  }

  h3 {
    font-style: normal;
    font-weight: 600;
    font-size: 11px;
    line-height: 14px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: @secondaryLabel;
    margin: 20px 0 8px 16px;
  }

  &__list {
    padding: 0 8px;
  }

  &__buttons {
    padding: 0 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    a {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 32px;
      letter-spacing: 0.5px;

      &:first-child {
        flex: 1;
        height: 36px;
      }
    }

    &-paste {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 8px 14px;
      background: rgba(98, 126, 234, 0.08);
      border-radius: 10px;
      font-style: normal;
      font-weight: 600;
      font-size: 12px;
      line-height: 16px !important;
      letter-spacing: 0.5px;
      color: @primary;
      box-sizing: border-box;
      cursor: pointer;
      transition: all 200ms ease-in-out;
      gap: 6px;

      svg {
        color: @primary;
      }

      &:hover {
        background: rgba(98, 126, 234, 0.15);
      }
    }
  }

  &__block {
    &-header {
      width: 100%;
      height: 56px;
      background: linear-gradient(
        135deg,
        rgba(98, 126, 234, 0.08) 0%,
        rgba(138, 100, 220, 0.05) 100%
      );
      box-sizing: border-box;
      padding: 14px 56px;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);

      h4 {
        font-style: normal;
        font-weight: 700;
        font-size: 18px;
        line-height: 28px;
        margin: 0;
        color: @primaryLabel;
        text-align: center;
      }
    }

    &-back {
      position: absolute;
      top: 10px;
      left: 8px;
      border-radius: 10px;
      cursor: pointer;
      padding: 8px;
      font-size: 0;
      transition: all 200ms ease-in-out;

      &:hover {
        background: rgba(0, 0, 0, 0.06);
        transform: translateX(-2px);
      }
    }
  }
}
</style>
