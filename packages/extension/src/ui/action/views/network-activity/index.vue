<template>
  <div class="container">
    <custom-scrollbar
      class="network-activity__scroll-area"
      :settings="scrollSettings({ suppressScrollX: true })"
    >
      <div class="network-activity">
        <network-activity-total
          :crypto-amount="cryptoAmount"
          :fiat-amount="fiatAmount"
          :token-price="tokenPrice"
          :price-change-percentage="priceChangePercentage"
          :sparkline="sparkline"
          :symbol="props.network.currencyName"
          v-bind="$attrs"
        />

        <network-activity-action v-bind="$attrs" />
        <div v-if="activities.length">
          <network-activity-transaction
            v-for="(item, index) in activities"
            :key="index + `${forceUpdateVal}`"
            :activity="item"
            :network="network"
          />
        </div>
        <!-- <div class="network-activity__header">July</div>

        <network-activity-transaction
          v-for="(item, index) in transactionsTwo"
          :key="index"
          :transaction="item"
        /> -->
      </div>
    </custom-scrollbar>

    <network-activity-loading
      v-if="activities.length === 0"
      :is-empty="isNoActivity"
    />
  </div>
</template>

<script setup lang="ts">
import NetworkActivityTotal from './components/network-activity-total.vue';
import NetworkActivityAction from './components/network-activity-action.vue';
import NetworkActivityTransaction from './components/network-activity-transaction.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import {
  computed,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  toRaw,
  toRef,
  watch,
} from 'vue';
import { AccountsHeaderData } from '../../types/account';
import accountInfoComposable from '@action/composables/account-info';
import { BaseNetwork } from '@/types/base-network';
import scrollSettings from '@/libs/utils/scroll-settings';

import {
  Activity,
  ActivityStatus,
  ActivityType,
  BTCRawInfo,
  EthereumRawInfo,
  SubscanExtrinsicInfo,
  SwapRawInfo,
  KadenaRawInfo,
  SOLRawInfo,
  MassaRawInfo,
} from '@/types/activity';
import NetworkActivityLoading from './components/network-activity-loading.vue';
import { ProviderName } from '@/types/provider';
import ActivityState from '@/libs/activity-state';
import Swap, {
  SupportedNetworkName,
  TransactionStatus,
  WalletIdentifier,
} from '@enkryptcom/swap';
import EvmAPI from '@/providers/ethereum/libs/api';
import type Web3Eth from 'web3-eth';
import { OperationStatus } from '@massalabs/massa-web3';

const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const {
  cryptoAmount,
  fiatAmount,
  tokenPrice,
  priceChangePercentage,
  sparkline,
} = accountInfoComposable(toRef(props, 'network'), toRef(props, 'accountInfo'));

const forceUpdateVal = ref(0);
const isNoActivity = ref(false);
const activities = ref<Activity[]>([]);
const selectedAddress = computed(
  () => props.accountInfo.selectedAccount?.address || '',
);
const apiPromise = props.network.api();
const activityState = new ActivityState();
let swap: Swap;
apiPromise.then(api => {
  swap = new Swap({
    api: (api as EvmAPI).web3 as Web3Eth,
    network: props.network.name as unknown as SupportedNetworkName,
    walletIdentifier: WalletIdentifier.enkrypt,
    evmOptions: {
      infiniteApproval: true,
    },
  });
});

/** Intervals that trigger calls to check for updates in transaction activity */
const activityCheckTimers: ReturnType<typeof setInterval>[] = [];

const activityAddress = computed(() =>
  props.network.displayAddress(props.accountInfo.selectedAccount!.address),
);

const updateVisibleActivity = (activity: Activity): void => {
  activities.value.forEach((act, idx) => {
    if (act.transactionHash === activity.transactionHash) {
      activities.value[idx] = activity;
    }
  });
  forceUpdateVal.value++;
};

/** Set a timer to periodically check (and update) the status of an activity item (transaction) */
const checkActivity = (activity: Activity): void => {
  activity = toRaw(activity);
  const timer = setInterval(() => {
    apiPromise.then(api => {
      api.getTransactionStatus(activity.transactionHash).then(info => {
        handleActivityUpdate(activity, info, timer);
      });
    });
  }, 5_000);

  // Register the interval timer so we can destroy it on component teardown
  activityCheckTimers.push(timer);
};

let isActivityUpdating = false;

const updateActivitySync = (activity: Activity) => {
  isActivityUpdating = true;
  return activityState
    .updateActivity(activity, {
      address: activityAddress.value,
      network: props.network.name,
    })
    .finally(() => {
      isActivityUpdating = false;
    });
};

const handleActivityUpdate = (activity: Activity, info: any, timer: any) => {
  if (props.network.provider === ProviderName.ethereum) {
    if (!info) return;
    if (isActivityUpdating) return;
    const evmInfo = info as EthereumRawInfo;
    activity.status = evmInfo.status
      ? ActivityStatus.success
      : ActivityStatus.failed;
    activity.rawInfo = evmInfo;
    updateActivitySync(activity).then(() => updateVisibleActivity(activity));
  } else if (props.network.provider === ProviderName.polkadot) {
    if (!info) return;
    const subInfo = info as SubscanExtrinsicInfo;
    if (!subInfo.pending) {
      if (isActivityUpdating) return;
      activity.status = subInfo.success
        ? ActivityStatus.success
        : ActivityStatus.failed;
      activity.rawInfo = subInfo;
      updateActivitySync(activity).then(() => updateVisibleActivity(activity));
    }
  } else if (props.network.provider === ProviderName.bitcoin) {
    if (!info) return;
    const btcInfo = info as BTCRawInfo;
    if (isActivityUpdating) return;
    activity.status = ActivityStatus.success;
    activity.rawInfo = btcInfo;
    updateActivitySync(activity).then(() => updateVisibleActivity(activity));
  } else if (props.network.provider === ProviderName.kadena) {
    if (!info) return;
    const kadenaInfo = info as KadenaRawInfo;
    if (isActivityUpdating) return;
    activity.status =
      kadenaInfo.result.status == 'success'
        ? ActivityStatus.success
        : ActivityStatus.failed;
    activity.rawInfo = kadenaInfo as KadenaRawInfo;
    updateActivitySync(activity).then(() => updateVisibleActivity(activity));
  } else if (props.network.provider === ProviderName.solana) {
    if (info) {
      const solInfo = info as SOLRawInfo;
      if (isActivityUpdating) return;
      activity.status = info.status
        ? ActivityStatus.success
        : ActivityStatus.failed;
      activity.rawInfo = solInfo;
      updateActivitySync(activity).then(() => updateVisibleActivity(activity));
    } else if (Date.now() > activity.timestamp + 3 * 60_000) {
      // Either our node is behind or the transaction was dropped
      // Consider the transaction expired
      if (isActivityUpdating) return;
      activity.status = ActivityStatus.dropped;
      updateActivitySync(activity).then(() => updateVisibleActivity(activity));
    } else {
      return; /* Give the transaction more time to be mined */
    }
  } else if (props.network.provider === ProviderName.massa) {
    if (!info) return;
    const massaInfo = info as MassaRawInfo;
    if (isActivityUpdating || massaInfo === OperationStatus.PendingInclusion)
      return;

    let status = ActivityStatus.failed;
    // if the transaction is not found, and it's been less than 1 minute, wait for it to be processed
    if (
      massaInfo === OperationStatus.NotFound &&
      Date.now() < activity.timestamp + 60_000
    ) {
      return;
    } else if (
      massaInfo === OperationStatus.Success ||
      massaInfo === OperationStatus.SpeculativeSuccess
    ) {
      status = ActivityStatus.success;
    }

    activity.status = status;
    activity.rawInfo = massaInfo;
    updateActivitySync(activity).then(() => updateVisibleActivity(activity));
  }

  // If we're this far in then the transaction has reached a terminal status
  // No longer need to check this activity
  clearInterval(timer);
};

const checkSwap = (activity: Activity): void => {
  activity = toRaw(activity);
  const timer = setInterval(() => {
    if (swap) {
      swap.initPromise.then(() => {
        swap.getStatus((activity.rawInfo as SwapRawInfo).status).then(info => {
          switch (info) {
            case TransactionStatus.pending:
              // noop
              return;
            case TransactionStatus.success:
              activity.status = ActivityStatus.success;
              break;
            case TransactionStatus.failed:
            case null:
              activity.status = ActivityStatus.failed;
              break;
            case TransactionStatus.dropped:
              activity.status = ActivityStatus.dropped;
              break;
            default:
              info satisfies never;
              console.error('Unknown swap status:', info);
              return;
          }
          activityState
            .updateActivity(activity, {
              address: activityAddress.value,
              network: props.network.name,
            })
            .then(() => updateVisibleActivity(activity));
        });
      });
    }
  }, 5000);
  activityCheckTimers.push(timer);
};
const selectedNetworkName = computed(() => props.network.name);
const setActivities = () => {
  activities.value = [];
  isNoActivity.value = false;
  if (props.accountInfo.selectedAccount)
    props.network.getAllActivity(activityAddress.value).then(all => {
      activities.value = all;
      isNoActivity.value = all.length === 0;
      activities.value.forEach(act => {
        if (
          (act.status === ActivityStatus.pending ||
            act.status === ActivityStatus.dropped) &&
          act.type === ActivityType.transaction
        ) {
          checkActivity(act);
        }
        if (
          (act.status === ActivityStatus.pending ||
            act.status === ActivityStatus.dropped) &&
          act.type === ActivityType.swap
        ) {
          checkSwap(act);
        }
      });
    });
  else activities.value = [];
};

watch([selectedAddress, selectedNetworkName], setActivities);
onMounted(() => {
  setActivities();
  activityCheckTimers.forEach(timer => clearInterval(timer));
  activityCheckTimers.length = 0;
});
onUnmounted(() => {
  activityCheckTimers.forEach(timer => clearInterval(timer));
  activityCheckTimers.length = 0;
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container {
  width: 100%;
  height: 600px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, @white 100%);
  box-shadow: none;
  margin: 0;
  padding-top: 0;
  box-sizing: border-box;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 180px;
    background: linear-gradient(
      180deg,
      rgba(98, 126, 234, 0.06) 0%,
      rgba(138, 100, 220, 0.04) 50%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 0;
  }

  .deposit {
    left: 0;
  }
}

.network-activity {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.3s ease-out;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 540px;
    margin: 0;
    padding: 68px 0 0 0 !important;
    box-sizing: border-box;
    .ps__rail-y {
      right: 3px !important;
      margin: 59px 0 !important;
    }
    &.ps--active-y {
      padding-right: 0;
    }
  }

  &__header {
    padding: 16px 24px 8px 24px;
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 18px;
    color: @tertiaryLabel;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}
</style>
