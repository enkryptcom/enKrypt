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
        :fiat-value="fiatValue"
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
        :price="fiatValue"
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
import { useRoute, useRouter } from 'vue-router';
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
import {
  isNumericPositive,
} from '@/libs/utils/number-formatter';
import { Address, formatMas, Mas } from '@massalabs/massa-web3';
import MassaAPI from '../../libs/api';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { getCustomError } from '@/libs/error';

interface Account {
  address: string;
  balance: string;
  name: string;
  publicKey: string;
  type: string;
}

interface TransactionParams {
  from: string;
  to: string;
  amount: string;
  fee?: string;
  data?: string;
  validityStartPeriod?: number;
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

const route = useRoute();
const router = useRouter();
const addressInputTo = ref();
const addressInputFrom = ref();
const amount = ref<string>('');
const fee = ref<string>('0.01');
const addressTo = ref<string>('');
const addressFrom = ref<string>('');
const isOpenSelectContactTo = ref<boolean>(false);
const isOpenSelectContactFrom = ref<boolean>(false);

// WindowPromise for handling the request/response
const windowPromise = WindowPromiseHandler(4); // 4 parameters: txParams, account, network, options

// Parse the transaction data from the route
const transactionData = computed(() => {
  try {
    if (!route.query.params || typeof route.query.params !== 'string') {
      console.warn('No transaction params found in route query');
      return null;
    }
    const params = JSON.parse(route.query.params);
    return params[0] as TransactionParams;
  } catch (error) {
    console.error('Error parsing transaction params:', error);
    return null;
  }
});

const account = computed(() => {
  try {
    if (!route.query.params || typeof route.query.params !== 'string') {
      console.warn('No account params found in route query, using props');
      // Create a proper Account object from AccountsHeaderData
      if (props.accountInfo?.selectedAccount) {
        const selectedIndex = props.accountInfo.activeAccounts.findIndex(
          acc => acc.address === props.accountInfo.selectedAccount?.address
        );
        const balance = selectedIndex >= 0 
          ? props.accountInfo.activeBalances[selectedIndex] || '0'
          : '0';
        
        return {
          address: props.accountInfo.selectedAccount.address,
          balance: balance,
          name: props.accountInfo.selectedAccount.name,
          publicKey: props.accountInfo.selectedAccount.publicKey || '',
          type: props.accountInfo.selectedAccount.walletType || ''
        };
      }
      return {
        address: '',
        balance: '0',
        name: '',
        publicKey: '',
        type: ''
      };
    }
    const params = JSON.parse(route.query.params);
    console.log('SEND component >>>>>params', params);
    console.log('SEND component >>>>>account', params[1]);

    return params[1] as Account;
  } catch (error) {
    console.error('Error parsing account params:', error);
    // Create a proper Account object from AccountsHeaderData
    if (props.accountInfo?.selectedAccount) {
      const selectedIndex = props.accountInfo.activeAccounts.findIndex(
        acc => acc.address === props.accountInfo.selectedAccount?.address
      );
      const balance = selectedIndex >= 0 
        ? props.accountInfo.activeBalances[selectedIndex] || '0'
        : '0';
      
      return {
        address: props.accountInfo.selectedAccount.address,
        balance: balance,
        name: props.accountInfo.selectedAccount.name,
        publicKey: props.accountInfo.selectedAccount.publicKey || '',
        type: props.accountInfo.selectedAccount.walletType || ''
      };
    }
    return {
      address: '',
      balance: '0',
      name: '',
      publicKey: '',
      type: ''
    };
  }
});

const network = computed(() => {
  try {
    if (!route.query.params || typeof route.query.params !== 'string') {
      console.warn('No network params found in route query, using props');
      return props.network;
    }
    const params = JSON.parse(route.query.params);
    return params[2] as BaseNetwork;
  } catch (error) {
    console.error('Error parsing network params:', error);
    return props.network;
  }
});

const accountBalance = computed(() => {
  // account.value.balance is already a float string (like "10.999"), not base units
  // So we just return it directly for display purposes
  return account.value.balance;
});

const fiatValue = computed(() => {
  // For now, we'll use a placeholder value. In a real implementation,
  // this would come from a price API
  return '0.01'; // Placeholder USD value
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
  const balanceBase = new BigNumber(account.value.balance).times(10 ** 9).toString(); // Convert float to base units
  const feeBase = toBase(fee.value, 9);
  
  const amountNum = BigInt(amountBase);
  const balanceNum = BigInt(balanceBase);
  const feeNum = BigInt(feeBase);
  
  return (amountNum + feeNum) <= balanceNum;
});

const insufficientAmount = computed(() => {
  if (!isNumericPositive(sendAmount.value)) {
    return '0';
  }
  
  // Convert all values to base units (smallest unit) for comparison
  const amountBase = toBase(sendAmount.value, 9);
  const balanceBase = new BigNumber(account.value.balance).times(10 ** 9).toString(); // Convert float to base units
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
  console.log('=== Validation Debug ===');
  console.log('addressTo.value:', addressTo.value);
  console.log('sendAmount.value:', sendAmount.value);
  console.log('hasEnoughBalance.value:', hasEnoughBalance.value);
  
  if (!addressTo.value) {
    console.log('❌ No address provided');
    return false;
  }
  
  try {
    Address.fromString(addressTo.value);
    console.log('✅ Address is valid');
  } catch (error) {
    console.log('❌ Invalid address:', error);
    return false;
  }
  
  if (!isValidDecimals(sendAmount.value, 9)) {
    console.log('❌ Invalid decimals for amount');
    return false;
  }
  
  const sendAmountBigNumber = new BigNumber(sendAmount.value);
  if (sendAmountBigNumber.isNaN()) {
    console.log('❌ Amount is NaN');
    return false;
  }
  if (sendAmountBigNumber.lte(0)) {
    console.log('❌ Amount is <= 0');
    return false;
  }
  
  const result = hasEnoughBalance.value;
  console.log('✅ All validations passed, hasEnoughBalance:', result);
  return result;
});

onMounted(async () => {
  try {
    // Get the request data from the window promise
    const { Request } = await windowPromise;
    
    // Parse the transaction data from the request
    const txParams = Request.value.params![0];
    const accountData = Request.value.params![1];
    const networkData = Request.value.params![2];
    const options = Request.value.params![3];
    
    console.log('Received request data:', { txParams, accountData, networkData, options });
    
    // Set the from address from the transaction parameters
    if (txParams.from) {
      addressFrom.value = txParams.from;
    }
    
    // Set the to address from the transaction parameters
    if (txParams.to) {
      addressTo.value = txParams.to;
    }
    
    // Set the amount from the transaction parameters
    if (txParams.amount) {
      amount.value = fromBase(txParams.amount, 9);
    }
    
    // Set the fee from the transaction parameters or options
    if (txParams.fee) {
      fee.value = fromBase(txParams.fee, 9);
    } else if (options?.fee) {
      fee.value = fromBase(options.fee.toString(), 9);
    }
    
    // Update the account object with the received data
    if (accountData) {
      // The account data should already be in the correct format
      // We can use it directly or update our local account object
    }
    
    // Update the network object with the received data
    if (networkData) {
      // The network data should already be in the correct format
      // We can use it directly or update our local network object
    }
    
  } catch (error) {
    console.error('Error handling request:', error);
  }
  
  // Fetch minimal fee from the network
  try {
    const api = await network.value.api() as MassaAPI;
    const minimalFeeBase = await api.getMinimalFee();
    const minimalFee = formatMas(BigInt(minimalFeeBase));
    fee.value = minimalFee;
    console.log(`fee value: ${fee.value}`);
  } catch (error) {
    console.error('Error fetching minimal fee:', error);
    // Keep default fee of 0.01 if API call fails
  }
});

const updateAccountBalance = async () => {
  if (addressFrom.value) {
    try {
      const api = await network.value.api() as MassaAPI;
      const balance = await api.getBalance(addressFrom.value);
      // Update the account object with the new balance
      if (account.value) {
        account.value.balance = balance;
      }
    } catch (error) {
      console.error('Error updating account balance:', error);
    }
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
};

const inputAmount = (inputAmount: string) => {
  if (inputAmount === '') {
    inputAmount = '0';
  }
  const inputAmountBn = new BigNumber(inputAmount);
  amount.value = inputAmountBn.lt(0) ? '0' : inputAmount;
};

const setMaxValue = () => {
  const balanceBase = new BigNumber(account.value.balance).times(10 ** 9).toString(); // Convert float to base units
  const feeBase = toBase(fee.value, 9);
  
  const balanceNum = BigInt(balanceBase);
  const feeNum = BigInt(feeBase);
  const maxAmountBase = balanceNum - feeNum;
  
  if (maxAmountBase > 0n) {
    amount.value = fromBase(maxAmountBase.toString(), 9);
  } else {
    amount.value = '0';
  }
};

const toggleSelector = (isTokenSend: boolean) => {
  // Massa only supports token sending for now
};

const sendAction = async () => {
  console.log('=== Send Action Debug ===');
  console.log('isInputsValid.value:', isInputsValid.value);
  console.log('addressTo.value:', addressTo.value);
  console.log('amount.value:', amount.value);
  console.log('fee.value:', fee.value);
  
  if (!isInputsValid.value) {
    console.log('❌ Inputs are not valid, aborting send action');
    return;
  }

  try {
    const transactionParams = {
      from: addressFrom.value,
      to: addressTo.value,
      amount: toBase(amount.value, 9),
      fee: toBase(fee.value, 9),
    };

    console.log('Transaction params:', transactionParams);

    // Get the Resolve function from the window promise
    const { Resolve } = await windowPromise;
    
    // Send the transaction parameters back to the background script
    Resolve.value({
      result: JSON.stringify(transactionParams)
    });

    console.log('✅ Transaction sent successfully');
    close();
  } catch (error) {
    console.error('❌ Error sending transaction:', error);
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