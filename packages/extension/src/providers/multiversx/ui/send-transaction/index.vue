<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
      <div class="send-transaction__header">
        <h3>Send</h3>
        <a class="send-transaction__close" @click="close">
          <close-icon />
        </a>
      </div>

      <send-address-input
        ref="addressInputFrom"
        :from="true"
        :value="addressFrom"
        :network="network"
        :disable-direct-input="true"
        :is-address="true"
        @click="toggleSelectContactFrom(true)"
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
        :is-address="fieldsValidation.addressTo"
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

      <send-token-select
        :token="selectedAsset"
        @update:toggle-token-select="toggleSelectToken"
      />

      <assets-select-list
        v-model="isOpenSelectToken"
        :is-send="true"
        :assets="accountAssets"
        :is-loading="isLoadingAssets"
        @update:select-asset="selectToken"
      />

      <send-input-amount
        :amount="amount"
        :show-max="true"
        :fiat-value="selectedAsset.price"
        :has-enough-balance="fieldsValidation.amount"
        @update:input-amount="inputAmount"
        @update:input-set-max="setSendMax"
      />

      <send-fee-select
        :fee="fee ?? { nativeSymbol: props.network.currencyName }"
      />

      <send-alert v-show="errorMsg" :error-msg="errorMsg" />

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :no-background="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle"
            :click="sendAction"
            :disabled="isDisabled"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import { CoinType, GenericNameResolver } from '@/libs/name-resolver';
import RecentlySentAddressesState from '@/libs/recently-sent-addresses';
import getUiPath from '@/libs/utils/get-ui-path';
import {
  formatFloatingPointValue,
  isNumericPositive,
} from '@/libs/utils/number-formatter';
import SendContactsList from '@/providers/common/ui/send-transaction/send-contacts-list.vue';
import SendFromContactsList from '@/providers/common/ui/send-transaction/send-from-contacts-list.vue';
import SendInputAmount from '@/providers/common/ui/send-transaction/send-input-amount.vue';
import { GasFeeInfo } from '@/providers/ethereum/ui/types';
import MultiversXAPI from '@/providers/multiversx/libs/api';
import { ProviderName } from '@/types/provider';
import { routes as RouterNames } from '@/ui/action/router';
import BaseButton from '@action/components/base-button/index.vue';
import CloseIcon from '@action/icons/common/close-icon.vue';
import { AccountsHeaderData } from '@action/types/account';
import AssetsSelectList from '@action/views/assets-select-list/index.vue';
import { isValidDecimals, toBase } from '@enkryptcom/utils';
import {
  Address,
  Transaction,
  TransactionComputer,
} from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';
import { debounce } from 'lodash';
import { computed, onMounted, PropType, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toBN } from 'web3-utils';
import Browser from 'webextension-polyfill';
import { MultiversXNetwork } from '../../types/mvx-network';
import { MVXToken } from '../../types/mvx-token';
import { VerifyTransactionParams } from '../types';
import SendAddressInput from './components/send-address-input.vue';
import SendAlert from './components/send-alert.vue';
import SendFeeSelect from './components/send-fee-select.vue';
import SendTokenSelect from './components/send-token-select.vue';

const props = defineProps({
  network: {
    type: Object as PropType<MultiversXNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const route = useRoute();
const router = useRouter();
const nameResolver = new GenericNameResolver();
const errorMsg = ref('');

const addressInputTo = ref();
const addressInputFrom = ref();
const isOpenSelectContactFrom = ref(false);
const isOpenSelectContactTo = ref(false);
const addressFrom = ref(props.accountInfo.selectedAccount!.address);
const addressTo = ref('');
const isOpenSelectToken = ref(false);
const amount = ref<string>();
const fee = ref<GasFeeInfo | null>(null);
const accountAssets = ref<MVXToken[]>([]);
const selectedAsset = ref<MVXToken | Partial<MVXToken>>(
  new MVXToken({
    icon: props.network.icon,
    balance: '0',
    price: '0',
    name: 'loading',
    symbol: 'loading',
    decimals: props.network.decimals,
  }),
);
const sendMax = ref(false);

const fieldsValidation = ref({
  addressTo: false,
  amount: false,
});

const selected: string = route.params.id as string;
const isLoadingAssets = ref(true);

const isAddress = computed(() => {
  return Address.isValid(addressTo.value);
});

onMounted(() => {
  trackSendEvents(SendEventType.SendOpen, { network: props.network.name });
  isLoadingAssets.value = true;
  fetchTokens();
});

const validateFields = async () => {
  errorMsg.value = '';
  fee.value = null;
  fieldsValidation.value = {
    addressTo: true,
    amount: true,
  };

  if (!selectedAsset.value) {
    return;
  }

  try {
    if (isAddress.value) {
      const to = props.network.displayAddress(addressTo.value);
      const from = props.network.displayAddress(addressFrom.value);

      if (to === from) {
        fieldsValidation.value.addressTo = false;
        errorMsg.value = '"To" address cannot be the same as "From" address';
        return;
      }
    } else {
      fieldsValidation.value.addressTo = false;
      return;
    }

    let rawAmount = new BigNumber('0');
    const minAmount = new BigNumber(1).shiftedBy(
      -selectedAsset.value.decimals!,
    );

    if (amount.value) {
      if (!isValidDecimals(amount.value, selectedAsset.value.decimals!)) {
        fieldsValidation.value.amount = false;
        errorMsg.value = `Amount cannot have more than ${selectedAsset.value.decimals} decimals`;
        return;
      }

      if (!isNumericPositive(amount.value)) {
        fieldsValidation.value.amount = false;
        errorMsg.value = 'Invalid amount. Amount has to be greater than 0';
        return;
      }

      rawAmount = new BigNumber(amount.value.toString()).shiftedBy(
        selectedAsset.value.decimals!,
      );

      if (rawAmount.lt(minAmount)) {
        fieldsValidation.value.amount = false;
        errorMsg.value = `Amount must be greater than ${minAmount.toFixed()}.`;
        return;
      }
    }

    if (amount.value || sendMax.value) {
      const rawBalance = new BigNumber(selectedAsset.value.balance!);

      const transaction = await selectedAsset.value.buildTransaction!(
        addressTo.value,
        props.accountInfo.selectedAccount,
        new BigNumber(amount.value!)
          .shiftedBy(selectedAsset.value.decimals!)
          .toFixed(0),
        props.network,
      );

      const rawFee = new BigNumber(computeTxFee(transaction).toString());

      if (sendMax.value) {
        transaction.value = BigInt(rawBalance.minus(rawFee).toFixed());
      }

      if (
        sendMax.value &&
        selectedAsset.value.name === accountAssets.value[0].name
      ) {
        rawAmount = rawBalance.minus(rawFee);
        if (rawAmount.gt(0)) {
          amount.value = rawAmount
            .shiftedBy(-selectedAsset.value.decimals!)
            .toFixed();
        }
      }

      if (rawAmount.plus(rawFee).gt(rawBalance)) {
        fieldsValidation.value.amount = false;
        errorMsg.value = 'Not enough balance.';
        return;
      }

      const nativeAsset = accountAssets.value[0];
      const txFeeHuman = rawFee
        .shiftedBy(-selectedAsset.value.decimals!)
        .toFixed();

      const txPrice = new BigNumber(nativeAsset.price!).times(txFeeHuman);

      fee.value = {
        fiatSymbol: 'USD',
        fiatValue: txPrice.toString(),
        nativeSymbol: nativeAsset.symbol ?? '',
        nativeValue: txFeeHuman.toString(),
      };
    }
  } catch (error: any) {
    errorMsg.value = error.message || 'An error occurred';
  }
};

watch([selectedAsset, addressTo, amount], validateFields);

watch(addressFrom, () => {
  fetchTokens();
});

const fetchTokens = async () => {
  const networkApi = (await props.network.api()) as MultiversXAPI;
  const networkAssets = await props.network.getAllTokens(addressFrom.value);
  const pricePromises = networkAssets.map(asset => asset.getLatestPrice());
  const balancePromises = networkAssets.map(asset => {
    if (!asset.balance) {
      return asset.getBalance(networkApi.api, addressFrom.value);
    }

    return Promise.resolve(asset.balance);
  });

  Promise.all([...pricePromises, ...balancePromises]).then(() => {
    const nonZeroAssets = networkAssets.filter(
      asset => !toBN(asset.balance ?? '0').isZero(),
    );

    if (nonZeroAssets.length == 0) {
      nonZeroAssets.push(networkAssets[0]);
    }

    selectedAsset.value = nonZeroAssets[0] as MVXToken;
    accountAssets.value = nonZeroAssets as MVXToken[];

    isLoadingAssets.value = false;
  });
};

const computeTxFee = (transaction: Transaction): bigint => {
  const txComputer = new TransactionComputer();
  const config = {
    minGasLimit: 50000n,
    gasPerDataByte: 1500n,
    gasPriceModifier: 0.01,
    chainID: '1',
  };

  return txComputer.computeTransactionFee(transaction, config);
};

const close = () => {
  trackSendEvents(SendEventType.SendDecline, {
    network: props.network.name,
  });
  router.go(-1);
};

const inputAddressFrom = (text: string) => {
  addressFrom.value = text;
};

const inputAddressTo = (text: string) => {
  const debounceResolve = debounce(() => {
    nameResolver
      .resolveName(text, [props.network.name as CoinType])
      .then(resolved => {
        if (resolved) {
          addressTo.value = resolved;
        }
      });
  }, 500);
  debounceResolve();
  addressTo.value = text;
};

const toggleSelectContactFrom = (open: boolean) => {
  isOpenSelectContactFrom.value = open;
};

const toggleSelectContactTo = (open: boolean) => {
  isOpenSelectContactTo.value = open;
};

const toggleSelectToken = () => {
  isOpenSelectToken.value = !isOpenSelectToken.value;
};

const selectAccountFrom = (account: string) => {
  addressFrom.value = account;
  isOpenSelectContactFrom.value = false;
};

const selectAccountTo = (account: string) => {
  addressTo.value = account;
  isOpenSelectContactTo.value = false;
};

const selectToken = (token: MVXToken | Partial<MVXToken>) => {
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (inputAmount: string) => {
  if (inputAmount === '') {
    inputAmount = '0';
  }
  const inputAmountBn = new BigNumber(inputAmount);
  sendMax.value = false;
  amount.value = inputAmountBn.lt(0) ? '0' : inputAmount;
};

const sendButtonTitle = computed(() => {
  let title = 'Send';

  if (!isDisabled.value && amount.value)
    title =
      'Send ' +
      formatFloatingPointValue(amount.value!).value +
      ' ' +
      selectedAsset.value?.symbol!.toUpperCase();

  return title;
});

const setSendMax = () => {
  sendMax.value = true;
  validateFields();
};

const isDisabled = computed(() => {
  return (
    !addressTo.value ||
    !amount.value ||
    !fieldsValidation.value.amount ||
    !fieldsValidation.value.addressTo ||
    !fee.value
  );
});

const recentlySentAddresses = new RecentlySentAddressesState();

const sendAction = async () => {
  await recentlySentAddresses.addRecentlySentAddress(
    props.network,
    addressTo.value,
  );

  const keyring = new PublicKeyRing();
  const fromAccount = await keyring.getAccount(addressFrom.value);
  const networkApi = (await props.network.api()) as MultiversXAPI;
  const chainId = await networkApi.getChainId();
  const txVerifyInfo: VerifyTransactionParams = {
    TransactionData: {
      from: fromAccount.address,
      to: addressTo.value,
      value: new BigNumber(amount.value!)
        .shiftedBy(selectedAsset.value.decimals!)
        .toFixed(),
    },
    toToken: {
      amount: toBase(amount.value!, selectedAsset.value.decimals!),
      decimals: selectedAsset.value.decimals!,
      icon: selectedAsset.value.icon as string,
      symbol: selectedAsset.value.symbol || 'unknown',
      valueUSD: new BigNumber(selectedAsset.value.price || '0')
        .times(amount.value!)
        .toFixed(),
      name: selectedAsset.value.name || '',
      price: selectedAsset.value.price || '0',
    },
    chainId: chainId,
    fromAddress: fromAccount.address,
    fromAddressName: fromAccount.name,
    txFee: fee.value!,
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

  if (fromAccount.isHardware) {
    await Browser.windows.create({
      url: Browser.runtime.getURL(
        getUiPath(
          `dot-hw-verify?id=${routedRoute.query.id}&txData=${routedRoute.query.txData}`,
          ProviderName.kadena,
        ),
      ),
      type: 'popup',
      focused: true,
      height: 600,
      width: 460,
    });
    window.close();
  } else {
    router.push(routedRoute);
  }
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

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

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

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
