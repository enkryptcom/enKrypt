<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
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
        :is-sending-disabled="isInputsValid && !isEstimateValid"
        @toggle-select="toggleSelectNft"
      />

      <nft-select-list
        v-if="!isSendToken"
        v-model="isOpenSelectNft"
        :address="addressFrom"
        :network="network"
        :selected-nft="tokenParamData"
        @select-nft="selectNFT"
      />

      <send-input-amount
        v-if="isSendToken"
        :amount="amount"
        :show-max="showMax"
        :fiat-value="selectedAsset.price"
        :has-enough-balance="hasEnoughBalance"
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

      <send-alert v-show="errorMsg" :error-msg="errorMsg" />

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :no-background="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle"
            :click="sendAction"
            :disabled="!isValidSend"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, PropType, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from 'lodash';
import SendHeader from '@/providers/common/ui/send-transaction/send-header.vue';
import SendAddressInput from './components/send-address-input.vue';
import SendFromContactsList from '@/providers/common/ui/send-transaction/send-from-contacts-list.vue';
import SendContactsList from '@/providers/common/ui/send-transaction/send-contacts-list.vue';
import AssetsSelectList from '@action/views/assets-select-list/index.vue';
import NftSelectList from '@/providers/common/ui/send-transaction/nft-select-list/index.vue';
import SendTokenSelect from './components/send-token-select.vue';
import SendAlert from './components/send-alert.vue';
import SendNftSelect from '@/providers/common/ui/send-transaction/send-nft-select.vue';
import SendInputAmount from '@/providers/common/ui/send-transaction/send-input-amount.vue';
import SendFeeSelect from '@/providers/common/ui/send-transaction/send-fee-select.vue';
import TransactionFeeView from '@action/views/transaction-fee/index.vue';
import BaseButton from '@action/components/base-button/index.vue';
import { NFTItemWithCollectionName, NFTItem, NFTType } from '@/types/nft';
import { AccountsHeaderData } from '@action/types/account';
import { numberToHex, toBN } from 'web3-utils';
import { GasPriceTypes, GasFeeType } from '@/providers/common/types';
import { EvmNetwork } from '../../types/evm-network';
import { Erc20Token } from '../../types/erc20-token';
import BigNumber from 'bignumber.js';
import { defaultGasCostVals } from '@/providers/common/libs/default-vals';
import Transaction from '@/providers/ethereum/libs/transaction';
import Web3Eth from 'web3-eth';
import {
  NATIVE_TOKEN_ADDRESS,
  MAX_UNAVAILABLE_NETWORKS,
} from '../../libs/common';
import { fromBase, toBase, isValidDecimals } from '@enkryptcom/utils';
import erc20 from '../../libs/abi/erc20';
import erc721 from '../../libs/abi/erc721';
import erc1155 from '../../libs/abi/erc1155';
import { SendTransactionDataType, VerifyTransactionParams } from '../types';
import {
  formatFloatingPointValue,
  isNumericPositive,
} from '@/libs/utils/number-formatter';
import { routes as RouterNames } from '@/ui/action/router';
import getUiPath from '@/libs/utils/get-ui-path';
import Browser from 'webextension-polyfill';
import { ProviderName } from '@/types/provider';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { GenericNameResolver, CoinType } from '@/libs/name-resolver';
import { NetworkNames } from '@enkryptcom/types';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import RecentlySentAddressesState from '@/libs/recently-sent-addresses';
import { parseCurrency } from '@/ui/action/utils/filters';

const props = defineProps({
  network: {
    type: Object as PropType<EvmNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const loadingAsset = new Erc20Token({
  icon: props.network.icon,
  symbol: 'Loading',
  balance: '0',
  price: '0',
  name: 'loading',
  contract: '0x0',
  decimals: 18,
});

const route = useRoute();
const router = useRouter();

const nameResolver = new GenericNameResolver();
const addressInputTo = ref();
const selected: string = route.params.id as string;
const tokenParamData: NFTItem = JSON.parse(
  route.params.tokenData ? (route.params.tokenData as string) : '{}',
) as NFTItem;
const isSendToken = ref<boolean>(JSON.parse(route.params.isToken as string));
const accountAssets = ref<Erc20Token[]>([]);
const selectedAsset = ref<Erc20Token | Partial<Erc20Token>>(loadingAsset);
const amount = ref<string>('');
const isEstimateValid = ref(true);
const hasValidDecimals = computed(() => {
  return isValidDecimals(sendAmount.value, selectedAsset.value.decimals!);
});
const hasPositiveSendAmount = computed(() => {
  return isNumericPositive(sendAmount.value);
});
const hasEnoughBalance = computed(() => {
  if (!hasValidDecimals.value) {
    return false;
  }
  if (!hasPositiveSendAmount.value) {
    return false;
  }
  // check if valid sendAmount.value
  if (!isNumericPositive(sendAmount.value)) {
    return false;
  }

  // check if user has enough balance for fees
  if (
    toBN(
      toBase(
        gasCostValues.value[selectedFee.value].nativeValue,
        props.network.decimals,
      ),
    ).gt(toBN(nativeBalance.value))
  ) {
    return false;
  }

  return toBN(selectedAsset.value.balance ?? '0').gte(
    toBN(toBase(sendAmount.value ?? '0', selectedAsset.value.decimals!)),
  );
});

const sendAmount = computed(() => {
  if (isMaxSelected.value) {
    return parseFloat(assetMaxValue.value) < 0 ? '0' : assetMaxValue.value;
  } else if (amount.value && amount.value !== '') return amount.value;
  return '0';
});

const isMaxSelected = ref<boolean>(false);
const selectedFee = ref<GasPriceTypes>(
  props.network.name === NetworkNames.Ethereum || NetworkNames.Binance
    ? GasPriceTypes.REGULAR
    : GasPriceTypes.ECONOMY,
);
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const addressFrom = ref<string>(
  props.accountInfo.selectedAccount?.address ?? '',
);
const addressTo = ref<string>('');
const isLoadingAssets = ref(true);

const selectedNft = ref<NFTItemWithCollectionName>({
  id: '',
  contract: '',
  image: '',
  name: 'Loading',
  url: '',
  collectionName: '',
  type: NFTType.ERC721,
});

const showMax = computed(() => {
  if (selectedAsset.value.contract !== NATIVE_TOKEN_ADDRESS) return true;
  if (MAX_UNAVAILABLE_NETWORKS.includes(props.network.name)) return false;
  return true;
});

const nativeBalance = computed(() => {
  const accountIndex = props.accountInfo.activeAccounts.findIndex(
    acc => acc.address === addressFrom.value,
  );

  if (accountIndex !== -1) {
    const balance = props.accountInfo.activeBalances[accountIndex];

    if (balance !== '~') {
      return toBase(balance, props.network.decimals);
    }
  }

  return '0';
});

onMounted(async () => {
  trackSendEvents(SendEventType.SendOpen, { network: props.network.name });
  fetchAssets().then(setBaseCosts);
});

const TxInfo = computed<SendTransactionDataType>(() => {
  const web3 = new Web3Eth();
  const value =
    isSendToken.value && selectedAsset.value.contract === NATIVE_TOKEN_ADDRESS
      ? numberToHex(toBase(sendAmount.value, props.network.decimals))
      : '0x0';
  const toAddress =
    isSendToken.value && selectedAsset.value.contract === NATIVE_TOKEN_ADDRESS
      ? addressTo.value
      : isSendToken.value
        ? selectedAsset.value.contract
        : selectedNft.value.contract;
  const erc20Contract = new web3.Contract(erc20 as any);
  const erc721Contract = new web3.Contract(erc721 as any);
  const erc1155Contract = new web3.Contract(erc1155 as any);
  const data =
    isSendToken.value && selectedAsset.value.contract === NATIVE_TOKEN_ADDRESS
      ? '0x'
      : isSendToken.value
        ? erc20Contract.methods
            .transfer(
              addressTo.value.toLowerCase(),
              toBase(sendAmount.value, selectedAsset.value.decimals!),
            )
            .encodeABI()
        : selectedNft.value.type === NFTType.ERC721
          ? erc721Contract.methods
              .transferFrom(
                addressFrom.value,
                addressTo.value,
                selectedNft.value.id,
              )
              .encodeABI()
          : erc1155Contract.methods
              .safeTransferFrom(
                addressFrom.value,
                addressTo.value,
                selectedNft.value.id,
                1,
                [],
              )
              .encodeABI();
  return {
    chainId: props.network.chainID,
    from: addressFrom.value as `0x{string}`,
    value: value as `0x${string}`,
    to: toAddress!.toLowerCase() as `0x${string}`,
    data: data as `0x${string}`,
  };
});
const Tx = computed(() => {
  const web3 = new Web3Eth(props.network.node);
  const tx = new Transaction(TxInfo.value, web3);
  return tx;
});

/**
 * Native balance after the transaction in the base unit of the
 * native currency (eg in WETH, Lamports, Satoshis, ...)
 */
const nativeBalanceAfterTransactionInBaseUnits = computed(() => {
  if (
    isSendToken.value &&
    nativeBalance.value &&
    selectedAsset.value &&
    selectedAsset.value.contract &&
    amount.value !== '' &&
    isValidDecimals(sendAmount.value, selectedAsset.value.decimals!)
  ) {
    let endingAmount = toBN(nativeBalance.value);

    if (selectedAsset.value.contract === NATIVE_TOKEN_ADDRESS) {
      const locAmount = isNumericPositive(amount.value) ? amount.value : '0';
      const rawAmount = toBN(
        toBase(locAmount ?? '0', selectedAsset.value.decimals!),
      );
      endingAmount = endingAmount.sub(rawAmount);
    }

    endingAmount = endingAmount.sub(
      toBN(
        toBase(
          gasCostValues.value[selectedFee.value].nativeValue,
          props.network.decimals,
        ),
      ),
    );

    return endingAmount;
  } else if (
    !isSendToken.value &&
    nativeBalance.value &&
    selectedNft.value.id
  ) {
    let endingAmount = toBN(nativeBalance.value);
    endingAmount = endingAmount.sub(
      toBN(
        toBase(
          gasCostValues.value[selectedFee.value].nativeValue,
          props.network.decimals,
        ),
      ),
    );
    return endingAmount;
  }

  return toBN(0);
});

/**
 * Native balance after the transaction in the human unit of the
 * native currency (eg in ETH, SOL, BTC, ...)
 */
const nativeBalanceAfterTransactionInHumanUnits = computed(() => {
  return fromBase(
    nativeBalanceAfterTransactionInBaseUnits.value.abs().toString(),
    props.network.decimals,
  );
});

const nativeCurrencyUsdPrice = computed(() => {
  return accountAssets.value[0]?.price || '0';
});

const balanceAfterInUsd = computed(() => {
  return new BigNumber(
    nativeBalanceAfterTransactionInHumanUnits.value.toString(),
  )
    .times(nativeCurrencyUsdPrice.value ?? '0')
    .toFixed();
});

const errorMsg = computed(() => {
  if (!hasValidDecimals.value) {
    return `Too many decimals.`;
  }

  if (!hasPositiveSendAmount.value) {
    return `Invalid amount.`;
  }

  if (
    !hasEnoughBalance.value &&
    nativeBalanceAfterTransactionInBaseUnits.value.isNeg()
  ) {
    return `Not enough funds. You are
      ~${formatFloatingPointValue(nativeBalanceAfterTransactionInHumanUnits.value).value}
      ${props.network.currencyName} (${parseCurrency(
        balanceAfterInUsd.value,
      )}) short.`;
  }

  if (!props.network.isAddress(addressTo.value) && addressTo.value !== '') {
    return `Invalid to address.`;
  }

  if (
    isSendToken.value &&
    !isValidDecimals(sendAmount.value, selectedAsset.value.decimals!)
  ) {
    return `Invalid decimals for ${selectedAsset.value.symbol}.`;
  }

  if (!isSendToken.value && !selectedNft.value.id) {
    return `Invalid NFT selected.`;
  }

  if (new BigNumber(sendAmount.value).gt(assetMaxValue.value)) {
    return `Not enough balance.`;
  }

  return '';
});

const setTransactionFees = (tx: Transaction) => {
  return tx
    .getGasCosts()
    .then(async gasvals => {
      const getConvertedVal = (type: GasPriceTypes) =>
        fromBase(gasvals[type], props.network.decimals);
      const nativeVal = accountAssets.value[0].price || '0';
      gasCostValues.value = {
        [GasPriceTypes.ECONOMY]: {
          nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.ECONOMY))
            .times(nativeVal!)
            .toString(),
          nativeSymbol: props.network.currencyName,
          fiatSymbol: 'USD',
        },
        [GasPriceTypes.REGULAR]: {
          nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.REGULAR))
            .times(nativeVal!)
            .toString(),
          nativeSymbol: props.network.currencyName,
          fiatSymbol: 'USD',
        },
        [GasPriceTypes.FAST]: {
          nativeValue: getConvertedVal(GasPriceTypes.FAST),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST))
            .times(nativeVal!)
            .toString(),
          nativeSymbol: props.network.currencyName,
          fiatSymbol: 'USD',
        },
        [GasPriceTypes.FASTEST]: {
          nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FASTEST))
            .times(nativeVal!)
            .toString(),
          nativeSymbol: props.network.currencyName,
          fiatSymbol: 'USD',
        },
      };
      isEstimateValid.value = true;
    })
    .catch(e => {
      console.error('Error while fetching gas costs', e);
      isEstimateValid.value = false;
    });
};

const setBaseCosts = () => {
  const web3 = new Web3Eth(props.network.node);
  const tx = new Transaction(
    {
      chainId: props.network.chainID,
      from: props.accountInfo.selectedAccount!.address as `0x{string}`,
      value: '0x0',
      to: NATIVE_TOKEN_ADDRESS,
    },
    web3,
  );
  updateTransactionFees(tx);
};
const fetchAssets = () => {
  accountAssets.value = [];
  selectedAsset.value = loadingAsset;
  isLoadingAssets.value = true;
  return props.network.getAllTokens(addressFrom.value).then(allAssets => {
    accountAssets.value = allAssets as (Erc20Token & { contract: string })[];
    const hasParamData =
      isSendToken.value && tokenParamData && tokenParamData.contract;
    if (hasParamData) {
      const selectedToken = accountAssets.value.find(
        asset => asset.contract === tokenParamData.contract,
      );
      if (selectedToken) {
        selectedAsset.value = selectedToken as Erc20Token;
      }
    } else {
      selectedAsset.value = allAssets[0] as Erc20Token;
    }
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
  if (!isSendToken.value) {
    title = 'Send NFT';
  }
  return title;
});

const isValidSend = computed<boolean>(() => {
  if (!isInputsValid.value) return false;
  if (nativeBalanceAfterTransactionInBaseUnits.value.isNeg()) return false;
  if (!isEstimateValid.value) return false;
  return true;
});

const isInputsValid = computed<boolean>(() => {
  if (!props.network.isAddress(addressTo.value)) return false;
  if (
    isSendToken.value &&
    !isValidDecimals(sendAmount.value, selectedAsset.value.decimals!)
  ) {
    return false;
  }
  if (!isSendToken.value && !selectedNft.value.id) {
    return false;
  }
  const sendAmountBigNumber = new BigNumber(sendAmount.value);
  if (sendAmountBigNumber.isNaN()) return false;
  if (sendAmountBigNumber.gt(assetMaxValue.value)) return false;
  if (gasCostValues.value.REGULAR.nativeValue === '0') return false;
  if (!isNumericPositive(sendAmount.value)) return false;
  return true;
});

const updateTransactionFees = (tx: Transaction) => {
  if (isMaxSelected.value) {
    amount.value = '';
  }
  setTransactionFees(tx).then(() => {
    if (isMaxSelected.value) {
      amount.value =
        parseFloat(assetMaxValue.value) < 0 ? '0' : assetMaxValue.value;
    }
  });
};

const isOpenSelectContactFrom = ref<boolean>(false);
const isOpenSelectContactTo = ref<boolean>(false);
const isOpenSelectToken = ref<boolean>(false);

const isOpenSelectFee = ref<boolean>(false);

const isOpenSelectNft = ref(false);

watch(
  [isInputsValid, addressTo, selectedAsset, selectedNft, isSendToken],
  () => {
    if (isInputsValid.value) {
      updateTransactionFees(Tx.value);
    }
  },
);

watch([isSendToken], () => {
  inputAmount('0');
});

const close = () => {
  trackSendEvents(SendEventType.SendDecline, {
    network: props.network.name,
  });
  router.go(-1);
};

const assetMaxValue = computed(() => {
  if (!isSendToken.value) {
    return '0';
  }
  if (selectedAsset.value.contract === NATIVE_TOKEN_ADDRESS) {
    return fromBase(
      toBN(selectedAsset.value.balance || '0')
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
  } else
    return fromBase(
      selectedAsset.value.balance!,
      selectedAsset.value.decimals!,
    );
});
const setMaxValue = () => {
  isMaxSelected.value = true;
  if (isInputsValid.value) {
    updateTransactionFees(Tx.value);
  }
};
const inputAddressFrom = (text: string) => {
  addressFrom.value = text;
};

const inputAddressTo = async (text: string) => {
  const debounceResolve = debounce(() => {
    nameResolver
      .resolveName(
        text,
        [props.network.name as CoinType, 'ETH'],
        props.network.provider as string,
      )
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
  fetchAssets();
};

const selectAccountTo = (account: string) => {
  addressTo.value = account;
  isOpenSelectContactTo.value = false;
};

const selectToken = (token: Erc20Token) => {
  inputAmount('0');
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (inputAmount: string) => {
  if (inputAmount === '') {
    inputAmount = '0';
  }
  const inputAmountBn = new BigNumber(inputAmount);
  isMaxSelected.value = false;
  amount.value = inputAmountBn.lt(0) ? '0' : inputAmount;
  if (isInputsValid.value) {
    updateTransactionFees(Tx.value);
  }
};

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectFee.value;
};

const selectFee = (type: GasPriceTypes) => {
  selectedFee.value = type;
  isOpenSelectFee.value = false;
  if (isMaxSelected.value && isInputsValid.value)
    updateTransactionFees(Tx.value);
};

const recentlySentAddresses = new RecentlySentAddressesState();

const sendAction = async () => {
  await recentlySentAddresses.addRecentlySentAddress(
    props.network,
    addressTo.value,
  );

  const keyring = new PublicKeyRing();
  const fromAccountInfo = await keyring.getAccount(
    addressFrom.value.toLowerCase(),
  );
  const txVerifyInfo: VerifyTransactionParams = {
    TransactionData: TxInfo.value,
    isNFT: !isSendToken.value,
    NFTData: !isSendToken.value ? selectedNft.value : undefined,
    toToken: {
      amount: toBase(sendAmount.value, selectedAsset.value.decimals!),
      decimals: selectedAsset.value.decimals!,
      icon: selectedAsset.value.icon as string,
      symbol: selectedAsset.value.symbol || 'unknown',
      valueUSD: new BigNumber(selectedAsset.value.price || '0')
        .times(sendAmount.value)
        .toString(),
      name: selectedAsset.value.name || '',
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
          `eth-hw-verify?id=${routedRoute.query.id}&txData=${routedRoute.query.txData}`,
          ProviderName.ethereum,
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

const toggleSelectNft = (open: boolean) => {
  isOpenSelectNft.value = open;
};

const selectNFT = (item: NFTItemWithCollectionName) => {
  selectedNft.value = item;
  if (item.contract) {
    const web3 = new Web3Eth(props.network.node);
    const selectedNFTContract = new web3.Contract(
      erc1155 as any,
      item.contract,
    );
    selectedNFTContract.methods
      .supportsInterface('0xd9b67a26')
      .call()
      .then((is1155: boolean) => {
        selectedNft.value.type = is1155 ? NFTType.ERC1155 : NFTType.ERC721;
      });
  }

  isOpenSelectNft.value = false;
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
</style>
