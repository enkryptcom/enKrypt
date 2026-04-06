<template>
  <section
    v-if="activity.type === ActivityType.transaction"
    class="container-empty"
  >
    <a
      :href="transactionURL"
      target="_blank"
      class="network-activity__transaction"
    >
      <div class="network-activity__transaction-info">
        <img
          :src="
            network.identicon(
              network.displayAddress(
                activity.isIncoming ? activity.from : activity.to,
              ),
            )
          "
          @error="imageLoadError"
        />

        <div class="network-activity__transaction-info-name">
          <h4>
            {{
              $filters.replaceWithEllipsis(
                network.displayAddress(
                  activity.isIncoming ? activity.from : activity.to,
                ),
                6,
                6,
              )
            }}
            <span v-if="Number.isFinite(activity.crossChainId)">
              <sup
                class="network-activity__transaction-info-crosschain-superscript"
                >⛓️{{ activity.crossChainId }}</sup
              >
            </span>
          </h4>
          <p>
            <span
              class="network-activity__transaction-info-status"
              :class="{
                error: activity.status === ActivityStatus.failed,
                dropped: activity.status === ActivityStatus.dropped,
              }"
              >{{ status }}</span
            >
            <transaction-timer
              v-if="activity.status === ActivityStatus.pending"
              :date="activity.timestamp"
            />
            <span v-else-if="activity.timestamp !== 0">{{ date }}</span>
            <span
              v-if="network.subNetworks && activity.chainId !== undefined"
              class="network-activity__transaction-info-chainid"
              >{{ activity.isIncoming ? 'on' : 'from' }} chain
              {{ activity.chainId }}</span
            >
          </p>
        </div>
      </div>

      <div class="network-activity__transaction-amount">
        <h4>
          {{ !activity.isIncoming ? '-' : '' }}
          {{
            $filters.formatFloatingPointValue(
              fromBase(activity.value, activity.token.decimals),
            ).value
          }}
          <span>{{ activity.token.symbol }}</span>
        </h4>
        <p v-show="getFiatValue.gt(0)">
          {{ $filters.parseCurrency(getFiatValue) }}
        </p>
      </div>
    </a>
  </section>
  <section v-if="activity.type === ActivityType.swap" class="container-empty">
    <section class="network-activity__transaction">
      <div class="network-activity__transaction-info">
        <img
          :src="(activity.rawInfo as SwapRawInfo).toToken.logoURI"
          @error="imageLoadError"
        />

        <div class="network-activity__transaction-info-name">
          <h4>
            {{ swapMessage }}
          </h4>
          <p>
            <span
              class="network-activity__transaction-info-status"
              :class="{
                error: activity.status === ActivityStatus.failed,
                dropped: activity.status === ActivityStatus.dropped,
              }"
              >{{ status }}</span
            >
            <transaction-timer
              v-if="activity.status === ActivityStatus.pending"
              :date="activity.timestamp"
            />
            <span v-else-if="activity.timestamp !== 0">{{ date }}</span>
          </p>
        </div>
      </div>

      <div class="network-activity__transaction-amount">
        <h4>
          {{
            $filters.formatFloatingPointValue(
              fromBase(activity.value, activity.token.decimals),
            ).value
          }}
          <span>{{ $filters.truncate(activity.token.symbol, 40) }}</span>
        </h4>
        <p>
          {{ $filters.parseCurrency(getFiatValue) }}
        </p>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from 'vue';
import moment from 'moment';
import TransactionTimer from './transaction-timer.vue';
import {
  Activity,
  ActivityStatus,
  ActivityType,
  SwapRawInfo,
} from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import { fromBase } from '@enkryptcom/utils';
import { getNetworkByName } from '@/libs/utils/networks';
import BigNumber from 'bignumber.js';
import { imageLoadError } from '@/ui/action/utils/misc';
const props = defineProps({
  activity: {
    type: Object as PropType<Activity>,
    default: () => ({}),
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});

const status = ref('~');
const date = ref('~');

const transactionURL = computed(() => {
  return props.network.blockExplorerTX.replace(
    '[[txHash]]',
    props.activity.transactionHash,
  );
});

const getFiatValue = computed(() => {
  return new BigNumber(props.activity.token.price || '0').times(
    fromBase(props.activity.value, props.activity.token.decimals),
  );
});

type SwapActivityDescriptionData = {
  fromNetworkName: string;
  toNetworkName: string;
  fromTokenSymbol: string;
  toTokenSymbol: string;
};

const getSwapActivityDescriptionSync = (
  data: SwapActivityDescriptionData,
): string => {
  const { fromNetworkName, toNetworkName, fromTokenSymbol, toTokenSymbol } =
    data;
  if (fromNetworkName === toNetworkName || fromTokenSymbol !== toTokenSymbol) {
    return `Swap from` + ` ${fromTokenSymbol}` + ` to ${toTokenSymbol}`;
  }

  return (
    `Swap from` +
    ` ${fromTokenSymbol}` +
    ` to ${toTokenSymbol}` +
    ` (Loading...)`
  );
};

const getSwapActivityDescriptionAsync = async (
  data: SwapActivityDescriptionData,
): Promise<string> => {
  const { fromNetworkName, toNetworkName, fromTokenSymbol, toTokenSymbol } =
    data;
  if (fromNetworkName === toNetworkName || fromTokenSymbol !== toTokenSymbol) {
    return `Swap from` + ` ${fromTokenSymbol}` + ` to ${toTokenSymbol}`;
  }

  const toNetwork = await getNetworkByName(toNetworkName);
  if (!toNetwork) {
    return (
      `Swap from` +
      ` ${fromTokenSymbol}` +
      ` to ${fromTokenSymbol}` +
      ` (Unknown)`
    );
  }

  return (
    `Swap from` +
    ` ${fromTokenSymbol}` +
    ` to ${toTokenSymbol}` +
    ` (${toNetwork.name_long})`
  );
};

const swapMessage = ref('');
/** Used to avoid updating the description to include (Loading...) when nothing has changed */
let swapActivityDescriptionId: null | string = null;
watch(
  () => props.activity,
  function (activity) {
    if (activity.type !== ActivityType.swap) return;
    const rawInfo = activity.rawInfo as SwapRawInfo;
    const data: SwapActivityDescriptionData = {
      fromNetworkName: activity.network,
      toNetworkName: rawInfo.toToken.networkInfo.name,
      fromTokenSymbol: rawInfo.fromToken.symbol,
      toTokenSymbol: rawInfo.toToken.symbol,
    };
    const thisId = JSON.stringify(data);
    // no change
    if (swapActivityDescriptionId === thisId) return;
    swapActivityDescriptionId = thisId;
    swapMessage.value = getSwapActivityDescriptionSync(data);
    getSwapActivityDescriptionAsync(data).then(asyncMessage => {
      if (swapActivityDescriptionId !== thisId) return;
      swapMessage.value = asyncMessage;
    });
  },
  { immediate: true },
);

onMounted(() => {
  date.value = moment(props.activity.timestamp).fromNow();
  if (
    props.activity.status === ActivityStatus.success &&
    props.activity.isIncoming
  ) {
    status.value =
      props.activity.type === ActivityType.transaction ? 'Received' : 'Swapped';
  } else if (
    props.activity.status === ActivityStatus.success &&
    !props.activity.isIncoming
  ) {
    status.value =
      props.activity.type === ActivityType.transaction ? 'Sent' : 'Swapped';
  } else if (
    props.activity.status === ActivityStatus.pending &&
    props.activity.isIncoming
  ) {
    status.value =
      props.activity.type === ActivityType.transaction
        ? 'Receiving'
        : 'Swapping';
  } else if (
    props.activity.status === ActivityStatus.pending &&
    !props.activity.isIncoming
  ) {
    status.value =
      props.activity.type === ActivityType.transaction ? 'Sending' : 'Swapping';
  } else if (props.activity.status === ActivityStatus.dropped) {
    status.value = 'Dropped';
  } else {
    status.value = 'Failed';
  }
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container-empty {
  display: contents;
}

.network-activity {
  &__transaction {
    min-height: 68px;
    padding: 12px 16px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    text-decoration: none;
    cursor: pointer;
    margin: 4px 16px;
    border-radius: 12px;
    transition: all 0.2s ease-in-out;
    background: @white;
    border: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    animation: fadeInUp 0.3s ease-out;
    animation-fill-mode: backwards;

    &:hover {
      background: @white;
      border-color: rgba(98, 126, 234, 0.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    &-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      flex: 1;
      min-width: 0;

      img {
        width: 36px;
        height: 36px;
        margin-right: 12px;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
        object-fit: cover;
      }

      &-name {
        flex: 1;
        min-width: 0;

        h4 {
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 20px;
          color: @primaryLabel;
          margin: 0 0 2px 0;
          font-family: 'SF Mono', 'Monaco', 'Roboto Mono', monospace;
          letter-spacing: -0.3px;
        }

        p {
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.2px;
          color: @secondaryLabel;
          margin: 0;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          flex-direction: row;
          gap: 4px;

          .error {
            color: #dc2626;
            font-weight: 500;
          }
          .dropped {
            color: @tertiaryLabel;
            font-weight: 500;
          }
        }
      }

      &-crosschain-superscript {
        color: @secondaryLabel;
        font-size: 10px;
      }

      &-status {
        font-weight: 500;
      }

      &-chainid {
        opacity: 0.7;
      }
    }

    &-amount {
      text-align: right;
      flex-shrink: 0;
      margin-left: 12px;

      h4 {
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 20px;
        text-align: right;
        color: @primaryLabel;
        margin: 0 0 2px 0;

        span {
          font-weight: 500;
          font-size: 12px;
          color: @secondaryLabel;
          margin-left: 3px;
        }
      }

      p {
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.2px;
        color: @tertiaryLabel;
        margin: 0;
      }
    }
  }
}
</style>
