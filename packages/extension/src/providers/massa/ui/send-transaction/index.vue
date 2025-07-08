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

      <send-input-amount
        :amount="amount"
        :fiat-value="amountFiatValue"
        :has-enough-balance="hasEnoughBalance"
        :show-max="true"
        @update:input-amount="inputAmount"
        @update:input-set-max="setMaxValue"
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

      <send-alert
        v-show="!hasEnoughBalance && amount && parseFloat(amount) > 0"
        :native-symbol="network.name"
        :price="amountFiatValue"
        :is-balance-zero="parseFloat(accountBalance) === 0"
        :native-value="insufficientAmount"
        :decimals="9"
        :not-enough="!hasEnoughBalance"
      />

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
  // account.value.balance is already a float string (like "10.999"), not base units
  // So we just return it directly for display purposes
  return account.value.balance;
});

const masTokenInfo = ref<AssetsType | null>(null);

const amountFiatValue = computed(() => {
  if (
    !isNumericPositive(sendAmount.value) ||
    parseFloat(sendAmount.value) <= 0
  ) {
    return '0';
  }

  // Calculate fiat value using the cached MAS price
  const sendAmountBN = new BigNumber(sendAmount.value);
  const masPrice = masTokenInfo.value?.value || '0';
  const fiatValueBN = sendAmountBN.times(masPrice);

  return fiatValueBN.toFixed(2);
});

const feeFiatValue = computed(() => {
  if (
    !isNumericPositive(fee.value) ||
    parseFloat(fee.value) <= 0
  ) {
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
  if (!isNumericPositive(sendAmount.value)) {
    return true;
  }

  // Convert all values to base units (smallest unit) for comparison
  const amountBase = toBase(sendAmount.value, 9);
  const balanceBase = new BigNumber(account.value.balance)
    .times(10 ** 9)
    .toString(); // Convert float to base units
  const feeBase = toBase(fee.value, 9);

  const amountNum = BigInt(amountBase);
  const balanceNum = BigInt(balanceBase);
  const feeNum = BigInt(feeBase);

  return amountNum + feeNum <= balanceNum;
});

const insufficientAmount = computed(() => {
  if (!isNumericPositive(sendAmount.value)) {
    return '0';
  }

  // Convert all values to base units (smallest unit) for comparison
  const amountBase = toBase(sendAmount.value, 9);
  const balanceBase = new BigNumber(account.value.balance)
    .times(10 ** 9)
    .toString(); // Convert float to base units
  const feeBase = toBase(fee.value, 9);

  const amountNum = BigInt(amountBase);
  const balanceNum = BigInt(balanceBase);
  const feeNum = BigInt(feeBase);
  const totalNeeded = amountNum + feeNum;

  if (totalNeeded > balanceNum) {
    const insufficientBase = totalNeeded - balanceNum;
    return fromBase(insufficientBase.toString(), 9);
  }
  return '0';
});

const sendButtonTitle = computed(() => {
  let title = 'Send';
  if (isNumericPositive(sendAmount.value) && parseFloat(sendAmount.value) > 0) {
    title = 'Send ' + sendAmount.value + ' MAS';
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

  // Check if amount has valid decimals (max 9 for MAS)
  if (!isValidDecimals(sendAmount.value, 9)) {
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

  // Fetch MAS token info
  await updateMasTokenInfo();
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
};

const inputAmount = (inputAmount: string) => {
  if (inputAmount === '') {
    inputAmount = '0';
  }
  const inputAmountBn = new BigNumber(inputAmount);
  amount.value = inputAmountBn.lt(0) ? '0' : inputAmount;
};

const setMaxValue = () => {
  const balanceBase = new BigNumber(account.value.balance)
    .times(10 ** 9)
    .toString(); // Convert float to base units
  const feeBase = toBase(fee.value, 9);

  const balanceNum = BigInt(balanceBase);
  const feeNum = BigInt(feeBase);
  const maxAmountBase = balanceNum - feeNum;

  if (maxAmountBase > BigInt(0)) {
    amount.value = fromBase(maxAmountBase.toString(), 9);
  } else {
    amount.value = '0';
  }
};

const toggleSelector = (isTokenSend: boolean) => {
  // Massa only supports token sending for now
};

const sendAction = async () => {
  if (!isInputsValid.value) {
    return;
  }

  try {

    // Create verify transaction params
    const txVerifyInfo: VerifyTransactionParams = {
      TransactionData: {
        from: addressFrom.value,
        to: addressTo.value,
        value: amount.value,
        data: '0x' as `0x${string}`, // Massa doesn't use data field like Ethereum
      },
      toToken: {
        amount: toBase(amount.value, 9), // Massa has 9 decimals
        decimals: 9,
        icon: network.value.icon,
        symbol: network.value.currencyName,
        valueUSD: amountFiatValue.value,
        name: network.value.currencyNameLong,
        price: masTokenInfo.value?.valuef || '0',
      },
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
