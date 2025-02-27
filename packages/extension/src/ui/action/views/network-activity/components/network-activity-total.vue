<template>
  <div class="network-activity-total">
    <div v-if="cryptoAmount == '~'" class="network-activity-total__total">
      <balance-loader class="network-activity-total__loader-one" />
      <balance-loader class="network-activity-total__loader-two" />
    </div>
    <div v-else class="network-activity-total__total">
      <h3>
        {{ cryptoAmount }} <span>{{ symbol }}</span>
      </h3>
      <p>
        <span v-if="subnetwork !== ''">Chain {{ subnetwork }} &middot;</span>
        {{ fiatAmount }}
      </p>
    </div>
    <button
      :disabled="isAnonymizeBtnDisabled"
      v-if="network.name === NetworkNames.Firo && sparkAccount"
      class="network-activity-total__anonymize"
      :class="{'network-activity-total__anonymize-error': !!errorMsg}"
      @click="anonymizeFunds()"
    >
      Anonymize funds
    </button>
  </div>
</template>

<script setup lang="ts">
import BalanceLoader from '@action/icons/common/balance-loader.vue';
import {computed, PropType, ref,} from "vue";
import {BaseNetwork} from "@/types/base-network.ts";
import {NetworkNames} from "@enkryptcom/types/dist";
import {SparkAccount} from "@action/types/account.ts";
import {trackSendEvents} from "@/libs/metrics";
import {SendEventType} from "@/libs/metrics/types.ts";
import {sendToSparkAddress} from "@/libs/spark-handler";
import {isAxiosError} from "axios";

const emits = defineEmits<{
  (e: "update:spark-state", network: BaseNetwork): void;
}>();

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
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  sparkAccount: {
    type: Object as PropType<SparkAccount | null>,
    default: () => {
      return {};
    },
  },
});

const isTransferLoading = ref(false)
const errorMsg = ref()

const isAnonymizeBtnDisabled = computed(() => {
  return isTransferLoading.value || Number(props.cryptoAmount) <= 0
})

const anonymizeFunds = async () => {
  errorMsg.value = undefined
  if (!props.sparkAccount) return;
  try {
    isTransferLoading.value = true
    await sendToSparkAddress(
      props.sparkAccount.defaultAddress,
      props.cryptoAmount,
    )
    trackSendEvents(SendEventType.SendComplete, {
      network: props.network.name,
    });
    emits("update:spark-state", props.network);
  } catch (e) {
    console.log(e, "ERROR")
    if (isAxiosError(e)) {
      errorMsg.value = JSON.stringify(e.response?.data.error.message);
    } else {
      errorMsg.value = JSON.stringify(e);
    }

    const _e = e as {message?: string}
    trackSendEvents(SendEventType.SendFailed, {
      network: props.network.name,
      error: _e?.message,
    });
  } finally {
    isTransferLoading.value = false
  }
}
</script>

<style lang="less">
@import '@action/styles/theme.less';

.network-activity-total {
  display: flex;
  align-items: flex-start;

  &__anonymize-error {
    border: 1px solid @error !important;
    color: @error;
  }

  &__anonymize {
    padding: 8px 16px;
    outline: none;
    cursor: pointer;
    border-radius: 8px;
    border: 1px solid @darkBg;
    margin-top: 4px;
    background: @buttonBg;
    transition: all 300ms ease-in-out;

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

  &__total {
    padding: 0 20px 12px 20px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;

      span {
        font-variant: small-caps;
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
