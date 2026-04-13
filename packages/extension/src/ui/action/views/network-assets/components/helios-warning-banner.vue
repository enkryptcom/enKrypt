<template>
  <transition name="helios-banner-slide">
    <div v-if="show" class="helios-warning-banner" role="alert">
      <div class="helios-warning-banner__icon">
        <shield-alert-icon />
      </div>
      <div class="helios-warning-banner__body">
        <p class="helios-warning-banner__title">RPC provider may be lying</p>
        <p class="helios-warning-banner__detail">
          The Helios light client cryptographically verified that the balance
          shown for <strong>{{ tokenSymbol }}</strong> differs from what your RPC provider reported.
        </p>
        <p class="helios-warning-banner__values">
          RPC reported:&nbsp;<code>{{ rpcBalanceFormatted }}</code>&nbsp;·&nbsp;Proven on-chain:&nbsp;<code>{{ provenBalanceFormatted }}</code>
        </p>
        <a class="helios-warning-banner__learn-more" href="https://walletbeat.eth.limo/docs/chain-verification" target="_blank" rel="noopener noreferrer">
          Learn more about chain verification →
        </a>
      </div>
      <button class="helios-warning-banner__dismiss" aria-label="Dismiss warning" @click="$emit('dismiss')">✕</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ShieldAlertIcon from '@action/icons/common/shield-alert-icon.vue';
import { fromBase } from '@enkryptcom/utils';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';

const props = defineProps<{
  show: boolean;
  tokenSymbol: string;
  tokenDecimals: number;
  rpcBalance: string;
  provenBalance: string;
}>();

defineEmits<{ (e: 'dismiss'): void }>();

function hexToDecimalDisplay(hex: string, decimals: number): string {
  try {
    const raw = BigInt(hex).toString();
    return formatFloatingPointValue(fromBase(raw, decimals)).value;
  } catch {
    return hex;
  }
}

const rpcBalanceFormatted = computed(() => hexToDecimalDisplay(props.rpcBalance, props.tokenDecimals));
const provenBalanceFormatted = computed(() => hexToDecimalDisplay(props.provenBalance, props.tokenDecimals));
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.helios-warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 8px 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.07);
  border: 1.5px solid rgba(239, 68, 68, 0.35);
  &__icon { flex-shrink: 0; margin-top: 1px; color: #dc2626; svg { width: 20px; height: 20px; } }
  &__body { flex: 1; min-width: 0; }
  &__title { font-size: 13px; font-weight: 700; color: #b91c1c; margin: 0 0 4px 0; }
  &__detail { font-size: 12px; color: @primaryLabel; margin: 0 0 4px 0; line-height: 1.5; }
  &__values { font-size: 11px; color: @secondaryLabel; margin: 0 0 6px 0; code { font-family: monospace; background: rgba(0,0,0,0.05); padding: 1px 4px; border-radius: 4px; } }
  &__learn-more { font-size: 11px; color: #7559d1; text-decoration: none; font-weight: 600; &:hover { text-decoration: underline; } }
  &__dismiss { flex-shrink: 0; background: none; border: none; cursor: pointer; font-size: 14px; color: @tertiaryLabel; padding: 0 0 0 4px; &:hover { color: @primaryLabel; } }
}
.helios-banner-slide-enter-active, .helios-banner-slide-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.helios-banner-slide-enter-from, .helios-banner-slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
