<template>
  <div class="network-activity-total-wrapper">
    <div
      v-if="cryptoAmount == '~' && !assumedError"
      class="network-activity__total"
    >
      <balance-loader class="network-activity__loader-one" />
      <balance-loader class="network-activity__loader-two" />
    </div>
    <div v-else-if="assumedError" class="network-activity__total-error">
      <h3>
        <span>Loading balance error. Please try again later</span>
      </h3>
    </div>
    <div v-else class="network-activity__total">
      <h3>
        {{ cryptoAmount }} <span>{{ symbol }}</span>
      </h3>
      <p v-if="network.name !== NetworkNames.Firo">
        <span v-if="subnetwork !== ''">Chain {{ subnetwork }} &middot;</span>
        {{ $filters.parseCurrency(fiatAmount) }}
      </p>
      <h6 v-if="!!sparkAccount && network.name === NetworkNames.Firo">
        <span>{{ sparkBalanceFormatted }}</span>
        Private
        {{ symbol }}
      </h6>
    </div>
    <button
      v-if="sparkAccount && network.name === NetworkNames.Firo"
      class="btn__anonymize"
      @click="openAnonymizeFundsModal()"
    >
      <loader v-show="isSyncing" class="btn__anonymize__loading" />
      <span v-if="!isSyncing">Synchronized</span>
      <span v-else>Synchronizing...</span>
    </button>

    <synchronize-state
      v-if="synchronizeState && network.name === NetworkNames.Firo"
      v-model="synchronizeState"
      :isCoinSyncing="isCoinSyncing"
      :isTagSyncing="isTagSyncing"
      :network="network"
      :account-info="accountInfo"
      :spark-account="sparkAccount"
      :crypto-amount="cryptoAmount"
    />
  </div>
</template>

<script setup lang="ts">
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import BalanceLoader from '@action/icons/common/balance-loader.vue';
import { fromBase } from '@enkryptcom/utils';
import { computed, onBeforeMount, PropType, ref, watchEffect } from 'vue';
import { AccountsHeaderData, SparkAccount } from '@action/types/account';
import { NetworkNames } from '@enkryptcom/types';
import SynchronizeState from '@action/views/network-activity/components/synchronize-state.vue';
import Loader from '@action/icons/common/loader.vue';

const props = defineProps({
  cryptoAmount: {
    type: String,
    default: '0',
  },
  fiatAmount: {
    type: String,
    default: '0',
  },
  symbol: {
    type: String,
    default: '',
  },
  subnetwork: {
    type: String,
    default: '',
  },
  network: {
    type: Object as PropType<BitcoinNetwork>,
    default: () => ({}),
  },
  isCoinSyncing: {
    type: Boolean,
    default: false,
  },
  isTagSyncing: {
    type: Boolean,
    default: false,
  },
  sparkAccount: {
    type: Object as PropType<SparkAccount | null>,
    default: () => {
      return {};
    },
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

let timer: NodeJS.Timeout | null = null;
const assumedError = ref(false);
const synchronizeState = ref(false);

watchEffect(() => {
  if (timer) {
    clearTimeout(timer);
  }
  // set the timer on initial change to blank
  if (props.cryptoAmount == '~') {
    timer = setTimeout(() => {
      assumedError.value = true;
    }, 30000);
  }
});

onBeforeMount(() => {
  if (timer) {
    clearTimeout(timer);
  }
});

const isSyncing = computed(() => {
  return props.isCoinSyncing || props.isTagSyncing;
});

const sparkBalanceFormatted = computed(() => {
  const balance = props.sparkAccount?.sparkBalance?.availableBalance;
  if (!balance) return '0';
  return fromBase(String(balance), props.network.decimals ?? 8);
});

const openAnonymizeFundsModal = () => {
  synchronizeState.value = true;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.network-activity-total-wrapper {
  display: flex;
  align-items: flex-start;
}

.btn__anonymize {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  outline: none;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid @darkBg;
  background: @buttonBg;
  transition: all 300ms ease-in-out;

  &__loading {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: @darkBg;
    border: 1px solid @orange01;
  }

  &:disabled {
    cursor: not-allowed;
    color: @black07;
    background: @gray01;
    border: 1px solid @gray01;
  }
}

.network-activity {
  &__total-error {
    padding: 0 20px 12px 20px;

    h3 {
      span {
        color: @error;
      }
    }
  }
  &__total {
    padding: 0 20px 12px 20px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      color: @primaryLabel;
      margin: 0;

      span {
        font-variant: small-caps;
      }
    }

    h6 {
      font-size: 16px;
      line-height: 24px;
      color: @secondaryLabel;
      font-weight: 400;
      margin: 0;

      span {
        font-size: 14px;
      }
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @secondaryLabel;
      margin: 0;
    }
  }

  &__loader-one {
    width: 100px;
    height: 18px;
    margin-bottom: 13px;
    margin-top: 6px;
    display: block !important;
  }

  &__loader-two {
    width: 70px;
    height: 13px;
    display: block !important;
    margin-bottom: 6px;
  }
}
</style>
