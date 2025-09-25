<template>
  <div class="container">
    <div class="send-transaction">
      <send-header
        :is-send-token="true"
        :is-nft-available="false"
        @close="close"
        @toggle-type="toggleSelector"
      />

      <send-address-input
        ref="addressInputFrom"
        :from="true"
        :value="addressFrom"
        :network="network as MassaNetwork"
        :disable-direct-input="true"
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
        :network="network as MassaNetwork"
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
        v-if="selectedAsset"
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
        :fiat-value="tokenPrice"
        :has-enough-balance="
          hasValidDecimals && hasEnoughBalance && hasPositiveSendAmount
        "
        :show-max="true"
        @update:input-amount="inputAmount"
        @update:input-set-max="setMaxValue"
      />

      <send-alert
        v-show="
          hasValidDecimals &&
          !hasEnoughBalance &&
          amount &&
          parseFloat(amount) > 0
        "
        :error-msg="'Not enough funds.'"
      />

      <div class="fee-input-container">
        <div class="fee-input-content">
          <div class="fee-label">Fee (MAS)</div>
          <input
            v-model="fee"
            type="number"
            placeholder="{{ minimalFee }}"
            class="fee-input"
            step="0.000000001"
            min="{{ minimalFee }}"
          />
        </div>
        <div class="fee-info">
          Minimal fee from network:
          {{ minimalFee }}
        </div>
      </div>

      <send-alert v-show="errorMsg" :error-msg="errorMsg" />

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :no-background="true" />
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
import { ref, onMounted, PropType, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import SendHeader from '@/providers/common/ui/send-transaction/send-header.vue';
import SendAddressInput from './components/send-address-input.vue';
import SendContactsList from '@/providers/common/ui/send-transaction/send-contacts-list.vue';
import SendFromContactsList from '@/providers/common/ui/send-transaction/send-from-contacts-list.vue';
import SendInputAmount from '@/providers/common/ui/send-transaction/send-input-amount.vue';
import SendTokenSelect from './components/send-token-select.vue';
import AssetsSelectList from '@action/views/assets-select-list/index.vue';
import BaseButton from '@action/components/base-button/index.vue';
import SendAlert from '@/providers/solana/ui/send-transaction/components/send-alert.vue';
import { AccountsHeaderData } from '@action/types/account';
import { BaseNetwork } from '@/types/base-network';
import BigNumber from 'bignumber.js';
import { fromBase, toBase, isValidDecimals } from '@enkryptcom/utils';
import { isNumericPositive } from '@/libs/utils/number-formatter';
import { formatMas } from '@massalabs/massa-web3';
import MassaAPI from '../../libs/api';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { AssetsType } from '@/types/provider';

import { VerifyTransactionParams, TxFeeInfo } from '../../types';
import { routes as RouterNames } from '@/ui/action/router';
import { SignerType } from '@enkryptcom/types';
import { MassaNetwork } from '../../networks/massa-base';

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

const router = useRouter();
const addressInputTo = ref();
const addressInputFrom = ref();
const amount = ref<string>('');
const fee = ref<string>('0.01');
const minimalFee = ref<string>('0.01');
const addressTo = ref<string>('');
const addressFrom = ref<string>('');
const isOpenSelectContactTo = ref<boolean>(false);
const isOpenSelectContactFrom = ref<boolean>(false);
const isOpenSelectToken = ref<boolean>(false);
const isLoadingAssets = ref<boolean>(false);
const keyRing = new PublicKeyRing();

const account = computed(() => {
  // Create a proper AccountInfo object from AccountsHeaderData
  if (props.accountInfo?.selectedAccount) {
    const selectedIndex = props.accountInfo.activeAccounts.findIndex(
      acc => acc.address === props.accountInfo.selectedAccount?.address,
    );
    const balance =
      selectedIndex >= 0
        ? props.accountInfo.activeBalances[selectedIndex] || '0'
        : '0';

    return {
      address: props.accountInfo.selectedAccount.address,
      balance: balance,
      name: props.accountInfo.selectedAccount.name,
      publicKey: props.accountInfo.selectedAccount.publicKey || '',
      type: props.accountInfo.selectedAccount.walletType || '',
    };
  }
  return {
    address: '',
    balance: '0',
    name: '',
    publicKey: '',
    type: '',
  };
});

const network = computed(() => {
  return props.network;
});

const accountBalance = computed(() => {
  return account.value.balance;
});

const masTokenInfo = ref<AssetsType | null>(null);
const selectedAsset = ref<AssetsType | null>(null);
const accountAssets = ref<any[]>([]);

const tokenPrice = computed(() => {
  return selectedAsset.value?.value || '0';
});

const amountFiatValue = computed(() => {
  if (!isInputsValid.value) {
    return '0';
  }
  // Calculate fiat value using the selected token price
  const sendAmountBN = new BigNumber(sendAmount.value);
  const fiatValueBN = sendAmountBN.times(tokenPrice.value);
  return fiatValueBN.toFixed(2);
});

const feeFiatValue = computed(() => {
  if (!isNumericPositive(fee.value) || parseFloat(fee.value) <= 0) {
    return '0';
  }

  // Calculate fiat value using the cached MAS price
  const amountBN = new BigNumber(fee.value);
  const masPrice = masTokenInfo.value?.value || '0';
  const valueBN = amountBN.times(masPrice);

  return valueBN.toFixed(2);
});

const sendAmount = computed(() => {
  if (amount.value && amount.value !== '') return amount.value;
  return '';
});

const hasEnoughBalance = computed(() => {
  if (!selectedAsset.value || !sendAmount.value || sendAmount.value === '') {
    return true;
  }
  if (!hasValidDecimals.value) {
    return false;
  }
  const amount = BigInt(toBase(sendAmount.value, selectedAsset.value.decimals));
  const tokenBalance = BigInt(selectedAsset.value.balance || '0');
  const masBalance = BigInt(toBase(accountBalance.value, 9));
  const feeRaw = BigInt(toBase(fee.value, 9));

  // For MAS token, check if amount + fee <= balance
  if (selectedAsset.value.symbol === 'MAS') {
    return amount + feeRaw <= tokenBalance;
  } else if (masBalance < feeRaw) {
    return false;
  }

  return amount <= tokenBalance;
});

const sendButtonTitle = computed(() => {
  let title = 'Send';
  if (isInputsValid.value) {
    title = 'Send ' + sendAmount.value + ' ' + selectedAsset?.value?.symbol;
  }
  return title;
});

const hasValidDecimals = computed((): boolean => {
  if (!selectedAsset.value) return false;
  if (sendAmount.value === '') return true; // Empty amount is valid
  return isValidDecimals(sendAmount.value, selectedAsset.value.decimals);
});

const hasPositiveSendAmount = computed(() => {
  return sendAmount.value !== '' && isNumericPositive(sendAmount.value);
});

const errorMsg = computed(() => {
  // Only show decimal validation errors if an asset is selected
  if (selectedAsset.value && !hasValidDecimals.value) {
    return `Too many decimals.`;
  }

  if (
    !hasPositiveSendAmount.value &&
    sendAmount.value !== '0' &&
    sendAmount.value !== ''
  ) {
    return `Invalid amount.`;
  }

  if (
    addressTo.value &&
    addressTo.value.trim() !== '' &&
    network.value &&
    !(network.value as MassaNetwork).isValidAddress(addressTo.value)
  ) {
    return `Invalid to address.`;
  }

  return '';
});

const isInputsValid = computed<boolean>(() => {
  // First check if address is provided
  if (!addressTo.value || addressTo.value.trim() === '') {
    return false;
  }

  // Check if address is valid
  if (
    !network.value ||
    !(network.value as MassaNetwork).isValidAddress(addressTo.value)
  ) {
    return false;
  }

  // Check if a token is selected
  if (!selectedAsset.value) {
    return false;
  }

  // Check if amount is provided and not empty
  if (!sendAmount.value || sendAmount.value.trim() === '') {
    return false;
  }

  // Check if amount has valid decimals for the selected token
  if (!hasValidDecimals.value) {
    return false;
  }

  // Check if amount is a valid positive number
  if (!hasPositiveSendAmount.value) {
    return false;
  }

  // Check if amount is greater than 0 using BigNumber for precision
  const amountBN = new BigNumber(sendAmount.value);
  if (amountBN.lte(0)) {
    return false;
  }

  return hasEnoughBalance.value;
});

// Watch for address changes to update token info
watch(addressFrom, () => {
  updateMasTokenInfo();
});

onMounted(async () => {
  const currentAccount = account.value;
  if (currentAccount?.address && !addressFrom.value) {
    addressFrom.value = currentAccount.address;
  } else {
    const accounts = await keyRing.getAccounts([SignerType.ed25519mas]);
    addressFrom.value = accounts[0].address;
  }

  // Fetch minimal fee from the network
  try {
    const api = (await network.value.api()) as MassaAPI;
    const minimalFeeBase = await api.getMinimalFee();
    const minFee = formatMas(BigInt(minimalFeeBase));
    fee.value = minFee;
    minimalFee.value = minFee;
  } catch {
    // Keep default fee of 0.01 if API call fails
  }

  // Fetch MAS token info and load assets
  await updateMasTokenInfo();
  await loadAccountAssets();
});

const updateAccountBalance = async () => {
  if (addressFrom.value) {
    try {
      const api = (await network.value.api()) as MassaAPI;
      const balance = await api.getBalance(addressFrom.value);
      // Update the account object with the new balance
      if (account.value) {
        account.value.balance = balance;
      }
    } catch {}
  }
};

const updateMasTokenInfo = async () => {
  if (!addressFrom.value) return;

  try {
    const tokenInfos = await network.value.getAllTokenInfo(addressFrom.value);
    masTokenInfo.value =
      tokenInfos.find((t: AssetsType) => t.symbol === 'MAS') || null;
  } catch (error) {
    console.error('Failed to fetch MAS token info:', error);
  }
};

const loadAccountAssets = async () => {
  if (!addressFrom.value) return;

  try {
    isLoadingAssets.value = true;
    const tokenInfos = await network.value.getAllTokenInfo(addressFrom.value);

    // Add price field to AssetsType objects for compatibility with AssetsSelectList
    const tokensWithPrice = tokenInfos.map((token: AssetsType) => ({
      ...token,
      price: token.value, // Use value field as price for USD display
    }));

    accountAssets.value = tokensWithPrice;

    // Set MAS as default selected token (keep as AssetsType for selectedAsset)
    const masToken = tokenInfos.find((t: AssetsType) => t.symbol === 'MAS');
    if (masToken) {
      selectedAsset.value = masToken;
    }
  } catch (error) {
    console.error('Failed to load account assets:', error);
  } finally {
    isLoadingAssets.value = false;
  }
};

const close = () => {
  router.go(-1);
};

const inputAddressTo = (text: string) => {
  addressTo.value = text;
};

const inputAddressFrom = (text: string) => {
  addressFrom.value = text;
};

const toggleSelectContactTo = (open: boolean) => {
  isOpenSelectContactTo.value = open;
};

const toggleSelectContactFrom = (open: boolean) => {
  isOpenSelectContactFrom.value = open;
};

const selectAccountTo = (account: string) => {
  addressTo.value = account;
  isOpenSelectContactTo.value = false;
};

const selectAccountFrom = (account: string) => {
  addressFrom.value = account;
  isOpenSelectContactFrom.value = false;
  // Update the account balance when selecting a different account
  updateAccountBalance();
  // Update MAS token info for price calculation
  updateMasTokenInfo();
  // Reload assets for the new account
  loadAccountAssets();
};

const inputAmount = (inputAmount: string) => {
  if (inputAmount === '') {
    amount.value = '';
    return;
  }
  const inputAmountBn = new BigNumber(inputAmount);
  if (inputAmountBn.isNaN()) {
    // Keep the current valid amount if input is invalid
    return;
  }

  // Only allow positive amounts or empty string
  amount.value = inputAmountBn.lt(0) ? '' : inputAmount;
};

const setMaxValue = () => {
  if (!selectedAsset.value) return;

  const balanceBase = selectedAsset.value.balance || '0'; // balance is already in base units
  const feeBase = toBase(fee.value, 9); // Fee is always in MAS

  const balanceNum = BigInt(balanceBase);
  const feeNum = BigInt(feeBase);

  // For MAS token, subtract fee from balance
  if (selectedAsset.value.symbol === 'MAS') {
    const maxAmountBase = balanceNum - feeNum;
    if (maxAmountBase > 0n) {
      amount.value = fromBase(
        maxAmountBase.toString(),
        selectedAsset.value.decimals,
      );
    } else {
      amount.value = '0';
    }
  } else {
    // For other tokens, use full balance (fee is paid in MAS)
    if (balanceNum > 0n) {
      amount.value = fromBase(
        balanceNum.toString(),
        selectedAsset.value.decimals,
      );
    } else {
      amount.value = '0';
    }
  }
};

const toggleSelector = () => {
  // Massa only supports token sending for now
};

const toggleSelectToken = () => {
  isOpenSelectToken.value = !isOpenSelectToken.value;
};

const selectToken = (token: AssetsType) => {
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
  // Update amount input when token changes
  amount.value = '';
};

const sendAction = async () => {
  if (!isInputsValid.value || !selectedAsset.value) {
    return;
  }

  try {
    // Create verify transaction params
    const txVerifyInfo: VerifyTransactionParams = {
      toToken: {
        amount: toBase(amount.value, selectedAsset.value.decimals),
        decimals: selectedAsset.value.decimals,
        icon: selectedAsset.value.icon,
        symbol: selectedAsset.value.symbol,
        valueUSD: amountFiatValue.value,
        name: selectedAsset.value.name,
        price: selectedAsset.value.valuef || '0',
      },
      toTokenAddress: selectedAsset.value.contract,
      fromAddress: addressFrom.value,
      fromAddressName: account.value.name,
      txFee: {
        nativeValue: fee.value,
        fiatValue: feeFiatValue.value,
        nativeSymbol: network.value.currencyName,
        fiatSymbol: 'USD',
      } as TxFeeInfo,
      toAddress: addressTo.value,
    };

    // Navigate to verify transaction component
    const routedRoute = router.resolve({
      name: RouterNames.verify.name, // 'verify-transaction'
      query: {
        id: network.value.name,
        txData: Buffer.from(JSON.stringify(txVerifyInfo), 'utf8').toString(
          'base64',
        ),
      },
    });

    router.push(routedRoute);
  } catch {}
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
  padding-bottom: 100px; // Add padding to prevent content from overlapping with buttons

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
    background: @white; // Ensure buttons have a solid background

    &-cancel {
      width: 170px;
    }

    &-send {
      width: 218px;
    }
  }
}

.fee-input-container {
  min-height: 40px;
  height: auto;
  background: #ffffff;
  margin: 0 32px 8px 32px;
  border: 1px solid @gray02;
  border-radius: 10px;
  width: calc(~'100% - 64px');
  box-sizing: border-box;
  position: relative;
  padding: 10px 16px;

  .fee-input-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    margin-bottom: 4px;
  }

  .fee-label {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
    margin: 0;
  }

  .fee-input {
    width: 120px;
    height: 20px;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    border: 0 none;
    outline: none;
    padding: 0;
    background: transparent;
    caret-color: @primary;
    text-align: right;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type='number'] {
      appearance: textfield;
      -moz-appearance: textfield;
    }
  }

  .fee-info {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @tertiaryLabel;
    margin: 0;
  }
}

// Override send-input-amount size for Massa
:deep(.send-input-amount) {
  height: 80px;
  padding: 12px 16px;

  input {
    width: 250px;
    height: 32px;
    font-size: 28px;
    line-height: 32px;
  }

  &__fiat {
    bottom: 12px;
    left: 16px;
  }

  &__max {
    top: 50%;
    margin-top: -10px;
    height: 20px;
    line-height: 20px;
    font-size: 10px;
  }
}
</style>
