<template>
  <div class="container">
    <!-- Loading State -->
    <div v-if="isLoadingAssets" class="send-transaction__loading">
      <div class="send-transaction__loading-content">
        <div class="send-transaction__loading-spinner"></div>
        <p class="send-transaction__loading-text">Loading...</p>
      </div>
    </div>

    <div v-if="!!selected && !isLoadingAssets" class="send-transaction">
      <send-header
        :is-send-token="isSendToken"
        :is-nft-available="!!network.NFTHandler"
        @close="close"
        @toggle-type="toggleSelector"
      />

      <send-address-input
        ref="addressInputFrom"
        :from="true"
        :value="addressFrom"
        :network="network as BitcoinNetwork"
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
        :network="network as BitcoinNetwork"
        @update:input-address="inputAddressTo"
        @toggle:show-contacts="toggleSelectContactTo"
      />

      <send-contacts-list
        :show-accounts="isOpenSelectContactTo"
        :account-info="accountInfo"
        :address="addressTo"
        :network="network"
        @selected:account="selectAccountTo"
        @update:paste-from-clipboard="
          () => {
            addressInputTo.pasteFromClipboard();
            toggleSelectContactTo(false);
          }
        "
        @close="toggleSelectContactTo"
      />

      <send-token-select
        v-if="isSendToken"
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

      <send-nft-select
        v-if="!isSendToken"
        :item="selectedNft"
        :is-sending-disabled="false"
        @toggle-select="toggleSelectNft"
      />

      <nft-select-list
        v-if="!isSendToken"
        v-model="isOpenSelectNft"
        :address="addressFrom"
        :network="network"
        :selected-nft="paramNFTData"
        @select-nft="selectNFT"
      />

      <send-input-amount
        v-if="isSendToken"
        :amount="amount"
        :show-max="showMax"
        :fiat-value="selectedAsset.price"
        :has-enough-balance="!nativeBalanceAfterTransaction.isNeg()"
        @update:input-amount="inputAmount"
        @update:input-set-max="setMaxValue"
      />
      <send-fee-select
        :in-swap="false"
        :selected="selectedFee"
        :fee="gasCostValues[selectedFee]"
        @open-popup="toggleSelectFee"
      />

      <transaction-fee-view
        v-model="isOpenSelectFee"
        :fees="gasCostValues"
        :selected="selectedFee"
        :is-header="true"
        @gas-type-changed="selectFee"
      />

      <send-alert
        v-show="
          nativeBalanceAfterTransaction.isNeg() ||
          (Number(sendAmount) < (props.network as BitcoinNetwork).dust &&
            Number(sendAmount) > 0)
        "
        :native-symbol="network.name"
        :price="selectedAsset.price || '0'"
        :is-balance-zero="UTXOBalance.isZero()"
        :native-value="
          fromBase(
            nativeBalanceAfterTransaction.abs().toString(),
            network.decimals,
          )
        "
        :decimals="network.decimals"
        :below-dust="
          Number(sendAmount) < (props.network as BitcoinNetwork).dust
        "
        :dust="(props.network as BitcoinNetwork).dust.toString()"
        :not-enough="nativeBalanceAfterTransaction.isNeg()"
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
import SendFromContactsList from '@/providers/common/ui/send-transaction/send-from-contacts-list.vue';
import SendContactsList from '@/providers/common/ui/send-transaction/send-contacts-list.vue';
import AssetsSelectList from '@action/views/assets-select-list/index.vue';
import SendTokenSelect from './components/send-token-select.vue';
import SendAlert from '@/providers/bitcoin/ui/send-transaction/components/send-alert.vue';
import SendInputAmount from '@/providers/common/ui/send-transaction/send-input-amount.vue';
import SendFeeSelect from '@/providers/common/ui/send-transaction/send-fee-select.vue';
import TransactionFeeView from '@action/views/transaction-fee/index.vue';
import BaseButton from '@action/components/base-button/index.vue';
import SendNftSelect from '@/providers/common/ui/send-transaction/send-nft-select.vue';
import NftSelectList from '@/providers/common/ui/send-transaction/nft-select-list/index.vue';
import { AccountsHeaderData } from '@action/types/account';
import { toBN } from 'web3-utils';
import { GasPriceTypes, GasFeeType } from '@/providers/common/types';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import { BTCToken } from '../../types/btc-token';
import BigNumber from 'bignumber.js';
import { defaultGasCostVals } from '@/providers/common/libs/default-vals';
import { fromBase, toBase, isValidDecimals } from '@enkryptcom/utils';
import {
  formatFloatingPointValue,
  isNumericPositive,
} from '@/libs/utils/number-formatter';
import { routes as RouterNames } from '@/ui/action/router';
import getUiPath from '@/libs/utils/get-ui-path';
import Browser from 'webextension-polyfill';
import { ProviderName } from '@/types/provider';
import PublicKeyRing from '@/libs/keyring/public-keyring';

import { getGasCostValues, isAddress } from '../../libs/utils';
import BitcoinAPI from '@/providers/bitcoin/libs/api';
import { calculateSizeBasedOnType } from '../libs/tx-size';
import { HaskoinUnspentType } from '../../types';
import { VerifyTransactionParams } from '../types';
import { getTxInfo as getBTCTxInfo } from '@/providers/bitcoin/libs/utils';
import { NFTItem, NFTItemWithCollectionName, NFTType } from '@/types/nft';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import RecentlySentAddressesState from '@/libs/recently-sent-addresses';

const props = defineProps({
  network: {
    type: Object as PropType<BitcoinNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});
const loadingAsset = new BTCToken({
  icon: props.network.icon,
  symbol: 'Loading',
  balance: '0',
  price: '0',
  name: 'loading',
  decimals: props.network.decimals,
});

const addressInputTo = ref();
const route = useRoute();
const router = useRouter();
const selected: string = route.params.id as string;
const paramNFTData: NFTItem = JSON.parse(
  route.params.tokenData ? (route.params.tokenData as string) : '{}',
) as NFTItem;
const isSendToken = ref<boolean>(JSON.parse(route.params.isToken as string));
const accountAssets = ref<BTCToken[]>([]);
const selectedAsset = ref<BTCToken>(loadingAsset);
const amount = ref<string>('');
const accountUTXOs = ref<HaskoinUnspentType[]>([]);
const isOpenSelectNft = ref(false);
const isOpenSelectToken = ref(false);

const sendAmount = computed(() => {
  if (amount.value && amount.value !== '') return amount.value;
  return '0';
});

const isMaxSelected = ref<boolean>(false);
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.REGULAR);
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const addressFrom = ref<string>(
  props.accountInfo.selectedAccount?.address ?? '',
);
const addressTo = ref<string>('');
const isLoadingAssets = ref(true);

const showMax = computed(() => {
  return true;
});

onMounted(async () => {
  trackSendEvents(SendEventType.SendOpen, { network: props.network.name });
  fetchAssets().then(setBaseCosts);
});

const nativeBalanceAfterTransaction = computed(() => {
  if (!isNumericPositive(sendAmount.value)) {
    return toBN(0);
  }

  if (
    selectedAsset.value &&
    isValidDecimals(sendAmount.value, selectedAsset.value.decimals!)
  ) {
    return UTXOBalance.value.sub(
      toBN(toBase(sendAmount.value ?? '0', selectedAsset.value.decimals!)).add(
        toBN(
          toBase(
            gasCostValues.value[selectedFee.value].nativeValue,
            selectedAsset.value.decimals!,
          ),
        ),
      ),
    );
  }
  return toBN(0);
});

const setTransactionFees = (byteSize: number) => {
  const nativeVal = selectedAsset.value.price || '0';
  getGasCostValues(
    props.network as BitcoinNetwork,
    byteSize,
    nativeVal,
    props.network.decimals,
    props.network.currencyName,
  ).then(val => (gasCostValues.value = val));
};

const setBaseCosts = () => {
  updateUTXOs().then(() => {
    if (isMaxSelected.value) setMaxValue();
  });
};

const updateUTXOs = async () => {
  const api = (await props.network.api()) as BitcoinAPI;
  return api.getUTXOs(addressFrom.value).then(utxos => {
    accountUTXOs.value = utxos;
    const txSize = calculateSizeBasedOnType(
      accountUTXOs.value.length + (isSendToken.value ? 0 : 1),
      2,
      (props.network as BitcoinNetwork).networkInfo.paymentType,
    );
    setTransactionFees(Math.ceil(txSize));
  });
};

const fetchAssets = () => {
  selectedAsset.value = loadingAsset;
  isLoadingAssets.value = true;
  return props.network.getAllTokens(addressFrom.value).then(allAssets => {
    accountAssets.value = allAssets as BTCToken[];
    selectedAsset.value = allAssets[0] as BTCToken;
    isLoadingAssets.value = false;
  });
};

const toggleSelectToken = () => {
  isOpenSelectToken.value = !isOpenSelectToken.value;
};

const selectToken = (token: BTCToken) => {
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
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
  if (
    !isAddress(addressTo.value, (props.network as BitcoinNetwork).networkInfo)
  )
    return false;
  if (
    isSendToken.value &&
    !isValidDecimals(sendAmount.value, selectedAsset.value.decimals!)
  ) {
    return false;
  }
  if (!isSendToken.value && !selectedNft.value.id) {
    return false;
  }
  if (
    Number(sendAmount.value) < (props.network as BitcoinNetwork).dust &&
    isSendToken.value
  )
    return false;

  const sendAmountBigNumber = new BigNumber(sendAmount.value);
  if (sendAmountBigNumber.isNaN()) return false;
  if (sendAmountBigNumber.gt(assetMaxValue.value)) return false;
  return true;
});

watch([addressFrom], () => {
  if (addressFrom.value) {
    fetchAssets().then(setBaseCosts);
  }
});

const isOpenSelectContactFrom = ref<boolean>(false);
const isOpenSelectContactTo = ref<boolean>(false);

const isOpenSelectFee = ref<boolean>(false);

const selectedNft = ref<NFTItemWithCollectionName>({
  id: '',
  contract: '',
  image: '',
  name: 'Loading',
  url: '',
  collectionName: '',
  type: NFTType.Ordinals,
});

const close = () => {
  trackSendEvents(SendEventType.SendDecline, {
    network: props.network.name,
  });
  router.go(-1);
};

const UTXOBalance = computed(() => {
  return toBN(accountUTXOs.value.reduce((a, c) => a + c.value, 0));
});

const assetMaxValue = computed(() => {
  return fromBase(
    UTXOBalance.value
      .sub(
        toBN(
          toBase(
            gasCostValues.value[selectedFee.value].nativeValue,
            selectedAsset.value.decimals!,
          ),
        ),
      )
      .toString(),
    selectedAsset.value.decimals!,
  );
});

const setMaxValue = () => {
  isMaxSelected.value = true;
  amount.value =
    parseFloat(assetMaxValue.value) < 0 ? '0' : assetMaxValue.value;
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

const toggleSelectContactTo = (open: boolean) => {
  isOpenSelectContactTo.value = open;
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

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectFee.value;
};

const selectFee = (type: GasPriceTypes) => {
  selectedFee.value = type;
  isOpenSelectFee.value = false;
  if (isMaxSelected.value) setMaxValue();
};

const toggleSelectNft = (open: boolean) => {
  isOpenSelectNft.value = open;
};

const selectNFT = (item: NFTItemWithCollectionName) => {
  selectedNft.value = item;
  isOpenSelectNft.value = false;
};

const recentlySentAddresses = new RecentlySentAddressesState();

const sendAction = async () => {
  await recentlySentAddresses.addRecentlySentAddress(
    props.network,
    addressTo.value,
  );

  const keyring = new PublicKeyRing();
  const fromAccountInfo = await keyring.getAccount(addressFrom.value);
  const currentFee = toBN(
    toBase(
      gasCostValues.value[selectedFee.value].nativeValue,
      selectedAsset.value.decimals,
    ),
  );
  let txInfo = getBTCTxInfo(accountUTXOs.value);
  let toAmount = toBN(toBase(sendAmount.value, selectedAsset.value.decimals));
  if (isSendToken.value) {
    txInfo.outputs.push({
      address: addressTo.value,
      value: toAmount.toNumber(),
    });
  } else {
    const api = (await props.network.api()) as BitcoinAPI;
    const [txid, index] = selectedNft.value.id.split(':');
    const ordinalTx = await api.getTransactionStatus(txid);
    const ordinalOutput = ordinalTx!.outputs[parseInt(index)];
    txInfo = getBTCTxInfo(accountUTXOs.value, {
      address: ordinalOutput.address,
      block: {
        height: ordinalTx!.blockNumber,
        position: -1, // not needed
      },
      index: parseInt(index),
      pkscript: ordinalOutput.pkscript,
      txid,
      value: ordinalOutput.value,
    });
    toAmount = toBN(ordinalOutput.value);
    txInfo.outputs.push({
      address: addressTo.value,
      value: ordinalOutput.value,
    });
  }
  const remainder = UTXOBalance.value.sub(toAmount).sub(currentFee);
  if (remainder.gtn(0)) {
    txInfo.outputs.push({
      address: props.network.displayAddress(addressFrom.value),
      value: remainder.toNumber(),
    });
  }

  const txVerifyInfo: VerifyTransactionParams = {
    TxInfo: JSON.stringify(txInfo),
    isNFT: !isSendToken.value,
    NFTData: !isSendToken.value ? selectedNft.value : undefined,
    toToken: {
      amount: toAmount.toString(),
      decimals: selectedAsset.value.decimals!,
      icon: selectedAsset.value.icon as string,
      symbol: selectedAsset.value.symbol,
      valueUSD: new BigNumber(selectedAsset.value.price || '0')
        .times(sendAmount.value)
        .toString(),
      name: selectedAsset.value.name,
      price: selectedAsset.value.price || '0',
    },
    fromAddress: fromAccountInfo.address,
    fromAddressName: fromAccountInfo.name,
    gasFee: gasCostValues.value[selectedFee.value],
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
      url: Browser.runtime.getURL(
        getUiPath(
          `btc-hw-verify?id=${routedRoute.query.id}&txData=${routedRoute.query.txData}`,
          ProviderName.bitcoin,
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

const toggleSelector = (isTokenSend: boolean) => {
  isSendToken.value = isTokenSend;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.container {
  width: 100%;
  height: 600px;
  margin: 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.send-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: 88px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 16px 24px 24px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    gap: 12px;
    z-index: 10;
    background: @white;

    &-cancel {
      flex: 1;
      min-width: 0;

      :deep(.base-button) {
        border: 1.5px solid rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        font-weight: 600;
        transition: all 200ms ease-in-out;

        &:hover {
          border-color: rgba(0, 0, 0, 0.2);
          background: rgba(0, 0, 0, 0.02);
        }
      }
    }

    &-send {
      flex: 1.3;
      min-width: 0;

      :deep(.base-button) {
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(98, 126, 234, 0.3);
        transition: all 200ms ease-in-out;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(98, 126, 234, 0.4);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }

        &:disabled {
          background: #e2e8f0;
          box-shadow: none;
        }
      }
    }
  }

  &__loading {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    &-spinner {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(98, 126, 234, 0.15);
      border-top-color: #627eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    &-text {
      font-size: 15px;
      font-weight: 500;
      color: @secondaryLabel;
      margin: 0;
      letter-spacing: 0.1px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  }

  // Staggered animation for child elements
  & > *:nth-child(1) {
    animation-delay: 0ms;
  }
  & > *:nth-child(2) {
    animation-delay: 30ms;
  }
  & > *:nth-child(3) {
    animation-delay: 60ms;
  }
  & > *:nth-child(4) {
    animation-delay: 90ms;
  }
  & > *:nth-child(5) {
    animation-delay: 120ms;
  }
  & > *:nth-child(6) {
    animation-delay: 150ms;
  }
  & > *:nth-child(7) {
    animation-delay: 180ms;
  }
  & > *:nth-child(8) {
    animation-delay: 210ms;
  }

  & > * {
    animation: elementFadeIn 250ms ease-out backwards;
  }

  @keyframes elementFadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
