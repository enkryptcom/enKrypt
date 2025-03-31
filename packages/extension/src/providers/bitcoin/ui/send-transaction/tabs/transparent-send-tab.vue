<template>
  <div class="form__container">
    <send-address-input
      ref="addressInputFrom"
      class="no-margin"
      :from="true"
      :value="addressFrom"
      :network="network as BitcoinNetwork"
      :disable-direct-input="true"
      @click="toggleSelectContactFrom(true)"
      @update:input-address="inputAddressFrom"
      @toggle:show-contacts="toggleSelectContactFrom"
    />

    <send-from-contacts-list
      class="no-margin"
      :show-accounts="isOpenSelectContactFrom"
      :account-info="accountInfo"
      :address="addressFrom"
      :network="network"
      @selected:account="selectAccountFrom"
      @close="toggleSelectContactFrom"
    />

    <div class="form__container-send-input">
      <send-spark-address-input
        v-if="network.name === 'Firo'"
        ref="addressInputTo"
        class="no-margin"
        title="To address"
        :value="addressTo"
        :network="network as BitcoinNetwork"
        @update:input-address="inputAddressTo"
        @toggle:show-contacts="toggleSelectContactTo"
      />
      <send-address-input
        v-if="network.name !== 'Firo'"
        ref="addressInputTo"
        class="no-margin"
        title="To address"
        :value="addressTo"
        :network="network as BitcoinNetwork"
        @update:input-address="inputAddressTo"
        @toggle:show-contacts="toggleSelectContactTo"
      />
      <send-contacts-list
        class="no-margin"
        :show-accounts="isOpenSelectContactTo"
        :account-info="accountInfo"
        :address="addressTo"
        :network="network"
        @selected:account="selectAccountTo"
        @update:paste-from-clipboard="addressInputTo.pasteFromClipboard()"
        @close="toggleSelectContactTo"
      />
    </div>

    <send-token-select
      v-if="isSendToken"
      class="no-margin"
      :token="selectedAsset"
    />

    <send-nft-select
      v-if="!isSendToken && !isSendSpark"
      class="no-margin"
      :item="selectedNft"
      :is-sending-disabled="false"
      @toggle-select="toggleSelectNft"
    />

    <nft-select-list
      v-show="isOpenSelectNft"
      class="no-margin"
      :address="addressFrom"
      :network="network"
      :selected-nft="paramNFTData"
      @close="toggleSelectNft"
      @select-nft="selectNFT"
    />

    <send-input-amount
      v-if="isSendToken"
      class="no-margin"
      :amount="amount"
      :fiat-value="selectedAsset.price"
      :has-enough-balance="!nativeBalanceAfterTransaction.isNeg()"
      @update:input-amount="inputAmount"
      @update:input-set-max="setMaxValue"
    />
    <send-fee-select
      class="no-margin"
      :in-swap="false"
      :selected="selectedFee"
      :fee="gasCostValues[selectedFee]"
      @open-popup="toggleSelectFee"
    />

    <transaction-fee-view
      :fees="gasCostValues"
      :show-fees="isOpenSelectFee"
      :selected="selectedFee"
      :is-header="true"
      @close-popup="toggleSelectFee"
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
      :native-value="
        fromBase(
          nativeBalanceAfterTransaction.abs().toString(),
          network.decimals,
        )
      "
      :decimals="network.decimals"
      :below-dust="Number(sendAmount) < (props.network as BitcoinNetwork).dust"
      :dust="(props.network as BitcoinNetwork).dust.toString()"
      :not-enough="nativeBalanceAfterTransaction.isNeg()"
    />
  </div>

  <div class="send-transaction__buttons">
    <div class="send-transaction__buttons-cancel">
      <base-button title="Cancel" :click="close" :no-background="true" />
    </div>
    <div class="send-transaction__buttons-send">
      <base-button
        :title="sendButtonTitle"
        :click="
          !isAddress(addressTo, network.networkInfo)
            ? sendSparkAction
            : sendAction
        "
        :disabled="!isInputsValid"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import getUiPath from '@/libs/utils/get-ui-path';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';
import BitcoinAPI from '@/providers/bitcoin/libs/api';
import {
  getTxInfo as getBTCTxInfo,
  getGasCostValues,
  isAddress,
  isSparkAddress,
} from '@/providers/bitcoin/libs/utils';
import { HaskoinUnspentType } from '@/providers/bitcoin/types';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import { BTCToken } from '@/providers/bitcoin/types/btc-token';
import SendAlert from '@/providers/bitcoin/ui/send-transaction/components/send-alert.vue';
import { defaultGasCostVals } from '@/providers/common/libs/default-vals';
import { GasFeeType, GasPriceTypes } from '@/providers/common/types';
import NftSelectList from '@/providers/common/ui/send-transaction/nft-select-list/index.vue';
import SendContactsList from '@/providers/common/ui/send-transaction/send-contacts-list.vue';
import SendFeeSelect from '@/providers/common/ui/send-transaction/send-fee-select.vue';
import SendFromContactsList from '@/providers/common/ui/send-transaction/send-from-contacts-list.vue';
import SendInputAmount from '@/providers/common/ui/send-transaction/send-input-amount.vue';
import SendNftSelect from '@/providers/common/ui/send-transaction/send-nft-select.vue';
import { NFTItem, NFTItemWithCollectionName, NFTType } from '@/types/nft';
import { ProviderName } from '@/types/provider';
import { routes as RouterNames } from '@/ui/action/router';
import { AccountsHeaderData } from '@/ui/action/types/account';
import BaseButton from '@action/components/base-button/index.vue';
import TransactionFeeView from '@action/views/transaction-fee/index.vue';
import { fromBase, isValidDecimals, toBase } from '@enkryptcom/utils';
import BigNumber from 'bignumber.js';
import { computed, onMounted, PropType, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toBN } from 'web3-utils';
import Browser from 'webextension-polyfill';
import { calculateSizeBasedOnType } from '../../libs/tx-size';
import { VerifyTransactionParams } from '../../types';
import SendAddressInput from '../components/send-address-input.vue';
import SendSparkAddressInput from '../components/send-spark-address-input.vue';
import SendTokenSelect from '../components/send-token-select.vue';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  network: {
    type: Object as PropType<BitcoinNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
  isSendToken: {
    type: Boolean,
    default: () => false,
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
const isSendSpark = ref(false);
const selected: string = route.params.id as string;
const paramNFTData: NFTItem = JSON.parse(
  route.params.tokenData ? (route.params.tokenData as string) : '{}',
) as NFTItem;
const selectedAsset = ref<BTCToken>(loadingAsset);
const amount = ref<string>('');
const accountUTXOs = ref<HaskoinUnspentType[]>([]);
const isOpenSelectNft = ref(false);

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

onMounted(async () => {
  trackSendEvents(SendEventType.SendOpen, { network: props.network.name });
  fetchAssets().then(setBaseCosts);
});

const nativeBalanceAfterTransaction = computed(() => {
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
  return api
    .getUTXOs(addressFrom.value)
    .then(utxos => {
      accountUTXOs.value = utxos;
      const txSize = calculateSizeBasedOnType(
        accountUTXOs.value.length + (props.isSendToken ? 0 : 1),
        2,
        (props.network as BitcoinNetwork).networkInfo.paymentType,
      );
      setTransactionFees(Math.ceil(txSize));
    })
    .catch(e => console.log(e, 123));
};

const fetchAssets = () => {
  selectedAsset.value = loadingAsset;
  isLoadingAssets.value = true;
  return props.network.getAllTokens(addressFrom.value).then(allAssets => {
    selectedAsset.value = allAssets[0] as BTCToken;
    isLoadingAssets.value = false;
  });
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
    !isSparkAddress(addressTo.value) &&
    !isAddress(addressTo.value, (props.network as BitcoinNetwork).networkInfo)
  ) {
    return false;
  }
  if (
    props.isSendToken &&
    !isValidDecimals(sendAmount.value, selectedAsset.value.decimals!)
  ) {
    return false;
  }
  if (!props.isSendToken && !selectedNft.value.id) {
    return false;
  }
  if (
    Number(sendAmount.value) < (props.network as BitcoinNetwork).dust &&
    props.isSendToken
  )
    return false;
  if (new BigNumber(sendAmount.value).gt(assetMaxValue.value)) return false;
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

const sendSparkAction = async () => {
  const keyring = new PublicKeyRing();
  const fromAccountInfo = await keyring.getAccount(addressFrom.value);
  const toAmount = toBN(toBase(sendAmount.value, selectedAsset.value.decimals));

  router.push({
    name: RouterNames.verifySendToSpark.name,
    query: {
      id: selected,
      txData: Buffer.from(
        JSON.stringify({
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
        }),
        'utf8',
      ).toString('base64'),
    },
  });
};

const sendAction = async () => {
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

  if (props.isSendToken) {
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
    isNFT: !props.isSendToken,
    NFTData: !props.isSendToken ? selectedNft.value : undefined,
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
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.form__container {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .no-margin {
    margin: 0 auto !important;
  }

  &-send-input {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 auto;

      button {
        outline: none;
        border: 1px solid @primaryLabel;
        padding: 4px 8px;
        box-sizing: border-box;
        display: block;
        background: @white07;
        border-radius: 6px;
        text-decoration: none;
        font-style: normal;
        font-weight: 500;
        font-size: 11px;
        line-height: 16px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: @primaryLabel;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
        cursor: pointer;
        transition: opacity 300ms ease-in-out;
      }

      &-active {
        border: 1px solid @white07 !important;
        background-color: @black !important;
        color: @white07 !important;
      }
    }
  }
}

.send-transaction {
  &__buttons {
    padding: 0 32px 32px 32px;
    margin-top: 20px;
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
p {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.25px;
  color: @error;
  margin: 0;
}
</style>
