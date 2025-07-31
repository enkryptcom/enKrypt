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
        :network="network"
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
        :has-enough-balance="hasEnoughBalance"
        :show-max="true"
        @update:input-amount="inputAmount"
        @update:input-set-max="setMaxValue"
      />

      <send-alert
        v-show="!hasEnoughBalance && amount && parseFloat(amount) > 0"
        :native-symbol="selectedAsset?.symbol || network.name"
        :price="amountFiatValue"
        :is-balance-zero="
          selectedAsset
            ? parseFloat(
                fromBase(selectedAsset.balance || '0', selectedAsset.decimals),
              ) === 0
            : parseFloat(accountBalance) === 0
        "
        :native-value="insufficientAmount"
        :decimals="selectedAsset?.decimals || 9"
        :not-enough="!hasEnoughBalance"
      />

      <div class="fee-input-container">
        <label>Fee (MAS)</label>
        <input
          v-model="fee"
          type="number"
          placeholder="0.01"
          class="fee-input"
          step="0.000000001"
          min="0"
        />
        <div class="fee-info">Minimal fee from network</div>
      </div>

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
import { ref, onMounted, PropType, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import SendHeader from '@/providers/common/ui/send-transaction/send-header.vue';
import SendAddressInput from './components/send-address-input.vue';
import SendContactsList from '@/providers/common/ui/send-transaction/send-contacts-list.vue';
import SendFromContactsList from '@/providers/common/ui/send-transaction/send-from-contacts-list.vue';
import SendInputAmount from '@/providers/common/ui/send-transaction/send-input-amount.vue';
import SendTokenSelect from './components/send-token-select.vue';
import AssetsSelectList from '@action/views/assets-select-list/index.vue';
import BaseButton from '@action/components/base-button/index.vue';
import SendAlert from '@/providers/common/ui/send-transaction/send-alert.vue';
import { AccountsHeaderData } from '@action/types/account';
import { BaseNetwork } from '@/types/base-network';
import BigNumber from 'bignumber.js';
import { fromBase, toBase, isValidDecimals } from '@enkryptcom/utils';
import { isNumericPositive } from '@/libs/utils/number-formatter';
import { Address, formatMas } from '@massalabs/massa-web3';
import MassaAPI from '../../libs/api';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { AssetsType } from '@/types/provider';

import { VerifyTransactionParams, TxFeeInfo } from '../../types';
import { routes as RouterNames } from '@/ui/action/router';
import { SignerType } from '@enkryptcom/types';

interface AccountInfo {
  address: string;
  balance: string;
  name: string;
  publicKey: string;
  type: string;
}

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
  if (
    !isNumericPositive(sendAmount.value) ||
    parseFloat(sendAmount.value) <= 0
  ) {
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
  return '0';
});

const hasEnoughBalance = computed(() => {
  if (!isNumericPositive(sendAmount.value) || !selectedAsset.value) {
    return true;
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

const insufficientAmount = computed(() => {
  if (!isNumericPositive(sendAmount.value) || !selectedAsset.value) {
    return '0';
  }

  // Convert all values to base units (smallest unit) for comparison
  const amountBase = toBase(sendAmount.value, selectedAsset.value.decimals);
  const balanceBase = selectedAsset.value.balance || '0'; // balance is already in base units
  const feeBase = toBase(fee.value, 9); // Fee is always in MAS

  const amountNum = BigInt(amountBase);
  const balanceNum = BigInt(balanceBase);
  const feeNum = BigInt(feeBase);

  // For MAS token, check if amount + fee <= balance
  if (selectedAsset.value.symbol === 'MAS') {
    const totalNeeded = amountNum + feeNum;
    if (totalNeeded > balanceNum) {
      const insufficientBase = totalNeeded - balanceNum;
      return fromBase(insufficientBase.toString(), 9);
    }
  } else {
    // For other tokens, only check if amount <= balance
    if (amountNum > balanceNum) {
      const insufficientBase = amountNum - balanceNum;
      return fromBase(
        insufficientBase.toString(),
        selectedAsset.value.decimals,
      );
    }
  }
  return '0';
});

const sendButtonTitle = computed(() => {
  let title = 'Send';
  if (
    isNumericPositive(sendAmount.value) &&
    parseFloat(sendAmount.value) > 0 &&
    selectedAsset.value
  ) {
    title = 'Send ' + sendAmount.value + ' ' + selectedAsset.value.symbol;
  }
  return title;
});

const isInputsValid = computed<boolean>(() => {
  // First check if address is provided
  if (!addressTo.value || addressTo.value.trim() === '') {
    return false;
  }

  // Check if address is valid
  try {
    Address.fromString(addressTo.value);
  } catch (error) {
    return false;
  }

  // Check if a token is selected
  if (!selectedAsset.value) {
    return false;
  }

  // Check if amount has valid decimals for the selected token
  if (!isValidDecimals(sendAmount.value, selectedAsset.value.decimals)) {
    return false;
  }

  // Check if amount is a valid number
  const amountNum = parseFloat(sendAmount.value);
  if (isNaN(amountNum)) {
    return false;
  }

  // Check if amount is greater than 0
  if (amountNum <= 0) {
    return false;
  }

  const result = hasEnoughBalance.value;
  return result;
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
    const minimalFee = formatMas(BigInt(minimalFeeBase));
    fee.value = minimalFee;
  } catch (error) {
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
    } catch (error) {}
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
    inputAmount = '0';
  }
  const inputAmountBn = new BigNumber(inputAmount);
  amount.value = inputAmountBn.lt(0) ? '0' : inputAmount;
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

const toggleSelector = (isTokenSend: boolean) => {
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
  } catch (error) {}
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
  margin: 0 32px 8px 32px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid @gray02;
  border-radius: 10px;
  width: calc(~'100% - 64px');
  box-sizing: border-box;
  position: relative;

  label {
    display: block;
    margin-bottom: 8px;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;
  }

  .fee-input {
    width: 100%;
    height: 24px;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    border: 0 none;
    outline: none;
    padding: 0;
    background: transparent;
    caret-color: @primary;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type='number'] {
      -moz-appearance: textfield;
    }
  }

  .fee-info {
    margin-top: 8px;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @tertiaryLabel;
  }
}
</style>
