<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
      <send-header :is-send-token="true" @close="close" />

      <send-address-input
        ref="addressInputFrom"
        :from="true"
        :value="addressFrom"
        :network="network"
        :disable-direct-input="true"
        @click="() => toggleSelectContactFrom(true)"
        @update:input-address="inputAddressFrom"
        @toggle:show-contacts="toggleSelectContactFrom"
      />

      <send-from-contacts-list
        :show-accounts="isOpenSelectContactFrom"
        :account-info="accountInfo"
        :address="addressFrom"
        :network="network"
        @selected:account="selectAccountFrom"
        @close="toggleSelectContactFrom"
      />

      <send-address-input
        ref="addressInputTo"
        :value="addressTo"
        :network="network"
        @update:input-address="inputAddressTo"
        @toggle:show-contacts="toggleSelectContactTo"
      />

      <send-contacts-list
        :show-accounts="isOpenSelectContactTo"
        :account-info="accountInfo"
        :address="addressTo"
        :network="network"
        @selected:account="selectAccountTo"
        @update:paste-from-clipboard="addressInputTo.pasteFromClipboard()"
        @close="toggleSelectContactTo"
      />

      <send-input-amount
        :amount="amount"
        :fiat-value="selectedAsset.price"
        :has-enough-balance="!nativeBalanceAfterTransaction.isNeg()"
        @update:input-amount="inputAmount"
        @update:input-set-max="setMaxValue"
      />

      <send-fee-select
        :in-swap="false"
        :selected-fee="selectedFee"
        :fee="gasCostValues[selectedFee]"
      />

      <send-alert
        v-if="
          nativeBalanceAfterTransaction.isNeg() || belowDust || isBalanceZero
        "
        :native-symbol="selectedAsset.symbol"
        :native-value="nativeBalanceAfterTransaction.abs().toString()"
        :price="selectedAsset.price"
        :not-enough="nativeBalanceAfterTransaction.isNeg()"
        :below-dust="belowDust"
        :is-balance-zero="isBalanceZero"
        :dust="fromBase(network.dust.toString(), network.decimals)"
      />

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :gray="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle"
            :click="sendAction"
            :disabled="!isInputsValid"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, PropType, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SendHeader from '@/providers/common/ui/send-transaction/send-header.vue';
import SendAddressInput from './components/send-address-input.vue';
import SendFromContactsList from '@/providers/common/ui/send-transaction/send-from-contacts-list.vue';
import SendContactsList from '@/providers/common/ui/send-transaction/send-contacts-list.vue';
import SendAlert from './components/send-alert.vue';
import SendInputAmount from '@/providers/common/ui/send-transaction/send-input-amount.vue';
import SendFeeSelect from '@/providers/common/ui/send-transaction/send-fee-select.vue';
import BaseButton from '@action/components/base-button/index.vue';
import { AccountsHeaderData } from '@action/types/account';
import { GasPriceTypes, GasFeeType } from '@/providers/common/types';
import { ECashNetwork } from '@/providers/ecash/networks/ecash-base';
import BigNumber from 'bignumber.js';
import { defaultGasCostVals } from '@/providers/common/libs/default-vals';
import { fromBase, toBase, isValidDecimals } from '@enkryptcom/utils';
import {
  formatFloatingPointValue,
  isNumericPositive,
} from '@/libs/utils/number-formatter';
import { routes as RouterNames } from '@/ui/action/router';
import Browser from 'webextension-polyfill';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { isValidECashAddress } from '@/providers/ecash/libs/utils';
import { VerifyTransactionParams } from '@/providers/bitcoin/ui/types';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import RecentlySentAddressesState from '@/libs/recently-sent-addresses';
import ChronikAPI from '@/providers/ecash/libs/api-chronik';
import {
  calculateTransactionFee,
  buildGasCostValues,
} from '@/providers/ecash/ui/libs/fee-calculator';
import {
  calculateUTXOBalance,
  calculateBalanceAfterTransaction,
  isBelowDustLimit,
  calculateMaxSendableValue,
} from '@/providers/ecash/ui/libs/send-utils';

const props = defineProps({
  network: {
    type: Object as PropType<ECashNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const addressInputTo = ref();
const route = useRoute();
const router = useRouter();
const selected: string = route.params.id as string;
const selectedAsset = ref<any>({
  icon: props.network.icon,
  symbol: props.network.currencyName,
  balance: '0',
  price: '0',
  name: props.network.name_long,
  decimals: props.network.decimals,
});
const amount = ref<string>('');
const accountUTXOs = ref<any[]>([]);

const sendAmount = computed(() => {
  if (amount.value && amount.value !== '') return amount.value;
  return '0';
});

const displayAddressFrom = computed(() =>
  props.network.displayAddress(addressFrom.value),
);

const amountInBase = computed(() =>
  toBase(sendAmount.value, selectedAsset.value.decimals!),
);

const isMaxSelected = ref<boolean>(false);
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.REGULAR);
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const addressFrom = ref<string>(
  props.accountInfo.selectedAccount?.address ?? '',
);
const addressTo = ref<string>('');

onMounted(async () => {
  trackSendEvents(SendEventType.SendOpen, { network: props.network.name });
  await fetchAssets();
  await setBaseCosts();
});

const assetPrice = computed(() => selectedAsset.value.price || '0');

const belowDust = computed(() => {
  return isBelowDustLimit(
    sendAmount.value,
    selectedAsset.value.decimals,
    props.network.dust,
  );
});

const currentGasFee = computed(() => gasCostValues.value[selectedFee.value]);

const isBalanceZero = computed(() => {
  return UTXOBalance.value.isZero();
});

const nativeBalanceAfterTransaction = computed(() => {
  const isValidAmount =
    isNumericPositive(sendAmount.value) &&
    isValidDecimals(sendAmount.value, selectedAsset.value.decimals!);

  return calculateBalanceAfterTransaction(
    sendAmount.value,
    UTXOBalance.value,
    currentGasFee.value.nativeValue,
    selectedAsset.value.decimals,
    props.network.decimals,
    isValidAmount,
  );
});

const setTransactionFees = async (fallbackByteSize?: number) => {
  const result = calculateTransactionFee({
    sendAmount: sendAmount.value,
    accountUTXOs: accountUTXOs.value,
    isEToken: false,
    selectedAsset: selectedAsset.value,
    networkDecimals: props.network.decimals,
    fallbackByteSize,
  });

  gasCostValues.value = buildGasCostValues(
    result.feeInXEC,
    assetPrice.value || '0',
    props.network.currencyName,
  );
};

const setBaseCosts = async () => {
  await updateUTXOs();
  if (isMaxSelected.value) setMaxValue();
};

const updateUTXOs = async () => {
  const api = (await props.network.api()) as unknown as ChronikAPI;
  const utxos = await api.getUTXOs(displayAddressFrom.value);
  accountUTXOs.value = utxos;

  await setTransactionFees(219);
};

const fetchAssets = async () => {
  const allAssets = await props.network.getAllTokens(addressFrom.value);
  selectedAsset.value = allAssets[0];
};

const sendButtonTitle = computed(() => {
  let title = 'Send';
  if (parseInt(sendAmount.value) > 0)
    title =
      'Send ' +
      formatFloatingPointValue(sendAmount.value).value +
      ' ' +
      selectedAsset.value?.symbol!.toUpperCase();
  return title;
});

const isInputsValid = computed<boolean>(() => {
  if (isCalculatingMax.value) return false;

  if (!isValidECashAddress(addressTo.value)) return false;
  if (!isValidDecimals(sendAmount.value, selectedAsset.value.decimals!))
    return false;

  const amountInBaseBn = new BigNumber(amountInBase.value || '0');
  if (amountInBaseBn.isNaN()) return false;
  if (amountInBaseBn.lt(props.network.dust)) return false;

  const sendAmountBn = new BigNumber(sendAmount.value);
  if (sendAmountBn.isNaN()) return false;
  if (sendAmountBn.lte(0)) return false;

  const maxBn = new BigNumber(assetMaxValue.value || '0');
  if (maxBn.isNaN()) return false;
  if (sendAmountBn.gt(maxBn)) return false;

  return true;
});

watch([addressFrom], () => {
  if (addressFrom.value) {
    fetchAssets().then(setBaseCosts);
  }
});

watch([sendAmount, selectedAsset], async () => {
  if (isCalculatingMax.value) return;

  if (accountUTXOs.value.length > 0) {
    await setTransactionFees();
  }
});

const isOpenSelectContactFrom = ref<boolean>(false);
const isOpenSelectContactTo = ref<boolean>(false);

const close = () => {
  trackSendEvents(SendEventType.SendDecline, {
    network: props.network.name,
  });
  router.go(-1);
};

const UTXOBalance = computed(() => {
  return calculateUTXOBalance(accountUTXOs.value);
});

const assetMaxValue = computed(() => {
  return calculateMaxSendableValue(
    UTXOBalance.value,
    currentGasFee.value.nativeValue,
    props.network.decimals,
    selectedAsset.value.decimals,
  );
});

const isCalculatingMax = ref(false);

const setMaxValue = async () => {
  if (isCalculatingMax.value) return;

  isMaxSelected.value = true;
  isCalculatingMax.value = true;

  try {
    amount.value = fromBase(
      UTXOBalance.value.toString(),
      selectedAsset.value.decimals,
    );

    await setTransactionFees();

    const adjustedAmountBn = new BigNumber(assetMaxValue.value || '0');
    amount.value = adjustedAmountBn.lt(0) ? '0' : assetMaxValue.value;

    await nextTick();
  } finally {
    isCalculatingMax.value = false;
  }
};

const inputAddressFrom = (text: string) => {
  addressFrom.value = text;
};

const inputAddressTo = (text: string) => {
  addressTo.value = text;
};

const toggleSelectContactFrom = (open: boolean) => {
  isOpenSelectContactFrom.value = open;
};

const toggleSelectContactTo = (open?: boolean) => {
  isOpenSelectContactTo.value =
    open !== undefined ? open : !isOpenSelectContactTo.value;
};

const selectAccountFrom = (account: string) => {
  addressFrom.value = account;
  isOpenSelectContactFrom.value = false;
  fetchAssets();
};

const selectAccountTo = (account: string) => {
  addressTo.value = props.network.displayAddress(account);
  isOpenSelectContactTo.value = false;
};

const inputAmount = (inputAmount: string) => {
  if (inputAmount === '') {
    inputAmount = '0';
  }
  const inputAmountBn = new BigNumber(inputAmount);
  isMaxSelected.value = false;
  amount.value = inputAmountBn.lt(0) ? '0' : inputAmount;
};

const recentlySentAddresses = new RecentlySentAddressesState();

const sendAction = async () => {
  await recentlySentAddresses.addRecentlySentAddress(
    props.network,
    addressTo.value,
  );

  const keyring = new PublicKeyRing();
  const fromAccountInfo = await keyring.getAccount(addressFrom.value);

  const txInfoData: any = {
    from: displayAddressFrom.value,
    to: addressTo.value,
    amount: amountInBase.value,
  };

  const txVerifyInfo: VerifyTransactionParams = {
    TxInfo: JSON.stringify(txInfoData),
    isNFT: false,
    toToken: {
      amount: amountInBase.value,
      decimals: selectedAsset.value.decimals!,
      icon: selectedAsset.value.icon as string,
      symbol: selectedAsset.value.symbol,
      valueUSD: new BigNumber(sendAmount.value)
        .times(assetPrice.value || '0')
        .toString(),
      name: selectedAsset.value.name,
      price: assetPrice.value || '0',
    },
    fromAddress: fromAccountInfo.address,
    fromAddressName: fromAccountInfo.name,
    gasFee: currentGasFee.value,
    gasPriceType: selectedFee.value,
    toAddress: addressTo.value,
  };

  const routedRoute = router.resolve({
    name: RouterNames.verify.name,
    query: {
      id: selected,
      txData: Buffer.from(JSON.stringify(txVerifyInfo), 'utf8').toString(
        'base64',
      ),
    },
  });

  if (fromAccountInfo.isHardware) {
    await Browser.windows.create({
      url: Browser.runtime.getURL(routedRoute.href),
      type: 'popup',
      width: 460,
      height: 660,
    });
    window.close();
  } else {
    router.push(routedRoute);
  }
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;
}

.send-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 32px 32px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;

    &-cancel {
      width: 170px;
    }

    &-send {
      width: 218px;
    }
  }
}
</style>
