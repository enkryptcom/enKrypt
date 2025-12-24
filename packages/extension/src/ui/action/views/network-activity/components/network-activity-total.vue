<template>
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
    <p>
      <span v-if="subnetwork !== ''">Chain {{ subnetwork }} &middot;</span>
      {{ $filters.parseCurrency(fiatAmount) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import BalanceLoader from '@action/icons/common/balance-loader.vue';
import { onBeforeMount, ref, watchEffect } from 'vue';

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
});

let timer: NodeJS.Timeout | null = null;
const assumedError = ref(false);

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
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.network-activity {
  &__total-error {
    padding: 0 24px 12px 24px;
    animation: fadeIn 0.3s ease-out;

    h3 {
      margin: 0;
      font-size: 14px;
      line-height: 20px;

      span {
        color: @error;
        font-weight: 500;
      }
    }
  }

  &__total {
    padding: 0 24px 12px 24px;
    animation: fadeIn 0.3s ease-out;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 28px;
      line-height: 36px;
      background: linear-gradient(135deg, #627eea 0%, #8a64dc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;

      span {
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(
          135deg,
          rgba(98, 126, 234, 0.7) 0%,
          rgba(138, 100, 220, 0.7) 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
      }
    }

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 22px;
      color: @secondaryLabel;
      margin: 4px 0 0 0;
    }
  }

  &__loader-one {
    width: 120px;
    height: 20px;
    margin-bottom: 12px;
    margin-top: 4px;
    display: block !important;
    border-radius: 6px;
  }

  &__loader-two {
    width: 80px;
    height: 14px;
    display: block !important;
    margin-bottom: 6px;
    border-radius: 4px;
  }
}
</style>
