<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
      <div class="common-popup__network">
        <img :src="network.icon" />
        <p>{{ network.name_long }}</p>
      </div>
    </template>

    <template #content>
      <h2>Verify transaction</h2>
      <hardware-wallet-msg :wallet-type="account.walletType" />
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__account">
          <img :src="identicon" />
          <div class="provider-verify-transaction__account-info">
            <h4>{{ account.name }}</h4>
            <div>
              <p>
                {{
                  $filters.formatFloatingPointValue(
                    fromBase(TokenBalance, network.decimals),
                  ).value
                }}
                <span>{{ network.currencyName }}</span>
              </p>
              <p>
                {{
                  $filters.replaceWithEllipsis(
                    account.address
                      ? network.displayAddress(account.address)
                      : '',
                    6,
                    4,
                  )
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img :src="Options.faviconURL" />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ Options.title }}</h4>
            <p>{{ Options.domain }}</p>
          </div>
        </div>

        <div class="provider-verify-transaction__amount">
          <img :src="network.icon" />

          <div class="provider-verify-transaction__amount-info">
            <h4>
              {{
                $filters.formatFloatingPointValue(
                  fromBase(getTotalOut.toString(), network.decimals),
                ).value
              }}
              <span>{{ network.currencyName }}</span>
            </h4>
            <p>
              {{
                fiatValue !== '~'
                  ? $filters.parseCurrency(fiatValue)
                  : fiatValue
              }}
            </p>
          </div>
        </div>

        <div
          v-if="!hasEnoughBalance && !isPreLoading"
          class="provider-verify-transaction__error"
        >
          <alert-icon />
          <p>You don't have enough balance for this transaction</p>
        </div>
      </div>
      <div class="provider-verify-transaction__message">
        <JsonTreeView
          v-if="psbtJSON !== ''"
          :data="psbtJSON"
          :max-depth="1"
          :root-key-string="'Transaction Data'"
        />
      </div>
      <send-fee-select
        :in-swap="true"
        :selected="selectedFee"
        :fee="gasCostValues[selectedFee]"
        @open-popup="() => {}"
      />
    </template>

    <template #button-left>
      <base-button
        title="Decline"
        :click="deny"
        :no-background="true"
        :disabled="isProcessing"
      />
    </template>

    <template #button-right>
      <base-button
        title="Sign"
        :click="approve"
        :disabled="isProcessing || !hasEnoughBalance || isPreLoading"
      />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { ref, ComponentPublicInstance, onBeforeMount } from 'vue';
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CommonPopup from '@action/views/common-popup/index.vue';
import SendFeeSelect from '@/providers/common/ui/send-transaction/send-fee-select.vue';
import HardwareWalletMsg from '@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue';
import AlertIcon from '@action/icons/send/alert-icon.vue';
import { getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { DEFAULT_BTC_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import { fromBase, hexToBuffer, bufferToHex } from '@enkryptcom/utils';
import { ProviderRequestOptions } from '@/types/provider';
import { GasFeeType } from './types';
import MarketData from '@/libs/market-data';
import { defaultGasCostVals } from '@/providers/common/libs/default-vals';
import { EnkryptAccount } from '@enkryptcom/types';
import { PSBTSigner } from './libs/signer';
import { BitcoinNetwork } from '../types/bitcoin-network';
import { GasPriceTypes } from '@/providers/common/types';
import { SignPSBTOptions } from '../types';
import { computed } from 'vue';
import { toBN } from 'web3-utils';
import { Psbt } from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import { JsonTreeView } from '@/libs/json-tree-view';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';

const isProcessing = ref(false);
const isPreLoading = ref(true);
const providerVerifyTransactionScrollRef = ref<ComponentPublicInstance>();
const TokenBalance = ref<string>('0');
const fiatValue = ref<string>('~');
const nativePrice = ref<string>('0');
const network = ref<BitcoinNetwork>(DEFAULT_BTC_NETWORK);
const marketdata = new MarketData();
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const account = ref<EnkryptAccount>({
  name: '',
  address: '',
} as EnkryptAccount);
const identicon = ref<string>('');
const windowPromise = WindowPromiseHandler(4);
const psbtHex = ref<string>('');
const psbtOptions = ref<SignPSBTOptions>({
  autoFinalized: true,
});
const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.ECONOMY);
const PSBT = ref<Psbt | null>(null);

defineExpose({ providerVerifyTransactionScrollRef });

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![3],
  )) as BitcoinNetwork;
  account.value = Request.value.params![2] as EnkryptAccount;
  psbtHex.value = Request.value.params![0];
  PSBT.value = Psbt.fromHex(psbtHex.value);
  psbtOptions.value = Request.value.params![1] as SignPSBTOptions;
  identicon.value = network.value.identicon(account.value.address);
  Options.value = options;
  if (network.value.api) {
    const api = await network.value.api();
    TokenBalance.value = await api.getBalance(account.value.address);
  }
  if (network.value.coingeckoID) {
    await marketdata
      .getTokenValue('1', network.value.coingeckoID, 'USD')
      .then(val => (nativePrice.value = val));
    fiatValue.value = new BigNumber(
      fromBase(getTotalOut.value.toString(), network.value.decimals),
    )
      .times(nativePrice.value)
      .toString();
  }
  setBaseCosts();
  isPreLoading.value = false;
});

const getFees = computed(() => {
  if (!PSBT.value) return 0;
  let totalIn = 0;
  PSBT.value.data.inputs.forEach(i => {
    totalIn += i.witnessUtxo ? i.witnessUtxo.value : 0;
  });
  let totalOuts = 0;
  PSBT.value.txOutputs.forEach(i => {
    totalOuts += i.value;
  });
  return totalIn - totalOuts;
});

const getTotalIn = computed(() => {
  if (!PSBT.value) return 0;
  let total = 0;
  PSBT.value.data.inputs.forEach((i, idx) => {
    if (PSBT.value!.inputHasPubkey(idx, hexToBuffer(account.value.address))) {
      total += i.witnessUtxo ? i.witnessUtxo.value : 0;
    }
  });
  return total;
});

const getTotalOut = computed(() => {
  if (!PSBT.value) return 0;
  let total = 0;
  PSBT.value.txOutputs.forEach(i => {
    if (i.address !== network.value.displayAddress(account.value.address)) {
      total += i.value;
    }
  });
  return total;
});

const psbtJSON = computed(() => {
  if (!PSBT.value) return '';
  const val = {
    inputs: [] as { address: string; value: string }[],
    outputs: [] as { address?: string; script?: string; value: string }[],
  };
  PSBT.value.data.inputs.forEach((i, idx) => {
    if (PSBT.value!.inputHasPubkey(idx, hexToBuffer(account.value.address))) {
      val.inputs.push({
        address: network.value.displayAddress(account.value.address),
        value: `${fromBase(
          i.witnessUtxo!.value.toString(),
          network.value.decimals,
        )} ${network.value.currencyName}`,
      });
    }
  });
  PSBT.value.txOutputs.forEach(i => {
    val.outputs.push({
      address: i.address || undefined,
      script: i.script ? bufferToHex(i.script).replace('0x', '') : undefined,
      value: `${fromBase(i.value.toString(), network.value.decimals)} ${
        network.value.currencyName
      }`,
    });
  });
  return JSON.stringify(val);
});
const hasEnoughBalance = computed(() => {
  if (!PSBT.value) return false;
  return toBN(TokenBalance.value).gte(toBN(getTotalIn.value));
});

const setTransactionFees = () => {
  gasCostValues.value.ECONOMY.nativeSymbol = 'BTC';
  gasCostValues.value.ECONOMY.nativeValue = fromBase(
    getFees.value.toString(),
    network.value.decimals,
  );
  gasCostValues.value.ECONOMY.fiatValue = new BigNumber(
    gasCostValues.value.ECONOMY.nativeValue,
  )
    .times(nativePrice.value)
    .toString();
};

const setBaseCosts = () => {
  if (!PSBT.value) return;
  setTransactionFees();
};

const approve = async () => {
  isProcessing.value = true;
  trackSendEvents(SendEventType.SendAPIApprove, {
    network: network.value.name,
  });
  const { Resolve } = await windowPromise;
  isProcessing.value = true;
  const signer = PSBTSigner(account.value, network.value as BitcoinNetwork);
  try {
    for (let i = 0; i < PSBT.value!.data.inputs.length; i++) {
      if (PSBT.value!.inputHasPubkey(i, hexToBuffer(account.value.address))) {
        await PSBT.value!.signInputAsync(
          i,
          signer,
          PSBT.value!.data.inputs[i].sighashType
            ? [PSBT.value!.data.inputs[i].sighashType!]
            : undefined,
        );
        if (psbtOptions.value.autoFinalized) PSBT.value!.finalizeInput(i);
      }
    }
    trackSendEvents(SendEventType.SendAPIComplete, {
      network: network.value.name,
    });
    Resolve.value({
      result: JSON.stringify(PSBT.value!.toHex()),
    });
  } catch (e: any) {
    trackSendEvents(SendEventType.SendAPIComplete, {
      network: network.value.name,
      error: e.error,
    });
    Resolve.value(e);
  }
};
const deny = async () => {
  trackSendEvents(SendEventType.SendAPIDecline, {
    network: network.value.name,
  });
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less">
@import '@action/styles/theme.less';
@import './styles/verify-transaction.less';
</style>
