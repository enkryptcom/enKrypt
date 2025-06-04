<template>
  <div>
    <div class="container">
      <div v-if="!!selected" class="swap">
        <div class="swap__header">
          <h3>Swap</h3>
          <a class="swap__close" @click="router.go(-1)">
            <close-icon />
          </a>
        </div>

        <div class="swap__wrap">
          <swap-token-amount-input
            v-if="fromToken"
            :value="fromAmount || ''"
            :token="fromToken"
            :autofocus="true"
            :error-message="errors.inputAmount"
            @update:input-max="setMax"
            @toggle:select="toggleFromToken"
            @update:value="inputAmountFrom"
          />

          <a class="swap__arrows"><swap-arrows /></a>

          <swap-network-select
            v-if="toNetwork"
            :network="toNetwork"
            @toggle:select="toggleToNetwork"
          />

          <swap-token-to-amount
            :token="toToken"
            :is-finding-rate="isFindingRate"
            :fast-list="trendingToTokens"
            :total-tokens="toTokens.length - trendingToTokens.length"
            :amount="toAmount"
            :no-providers="errors.noProviders"
            @update:select-asset="selectTokenTo"
            @toggle:select="toggleToToken"
          />

          <send-address-input
            ref="addressInput"
            :value="address"
            :is-valid-address="addressIsValid"
            :network-name="toAddressInputMeta.networkName"
            :display-address="toAddressInputMeta.displayAddress"
            :identicon="toAddressInputMeta.identicon"
            @update:input-address="inputAddress"
            @toggle:show-contacts="toggleSelectContact"
          />

          <send-contacts-list
            :show-accounts="isOpenSelectContact"
            :accounts="toAccounts"
            :address="address"
            :display-address="toAddressInputMeta.displayAddress"
            :identicon="toAddressInputMeta.identicon"
            @selected:account="selectAccount"
            @update:paste-from-clipboard="addressInput.pasteFromClipboard()"
            @close="toggleSelectContact"
          />
        </div>

        <div class="swap__buttons">
          <div class="swap__buttons-cancel">
            <base-button
              title="Cancel"
              :no-background="true"
              @click="router.go(-1)"
            />
          </div>
          <div class="swap__buttons-send">
            <base-button
              :title="sendButtonTitle"
              :click="sendAction"
              :disabled="isDisabled"
            />
          </div>
        </div>
      </div>
    </div>

    <network-select-list
      v-model="toNetworkOpen"
      :assets="toNetworks"
      @update:select-asset="selectToNetwork"
    />

    <assets-select-list
      v-model="fromSelectOpened"
      :assets="fromTokens"
      @update:select-asset="selectTokenFrom"
    />

    <assets-select-list
      v-model="toSelectOpened"
      :is-select-to-token="true"
      :assets="toTokens"
      :is-loading="fetchingTokens"
      @update:select-asset="selectTokenTo"
    />

    <swap-looking
      v-show="isLooking"
      :loading-type="LoadingType"
      :close="toggleLooking"
    />
    <swap-error-popup
      v-if="showSwapError"
      :error="swapError"
      :network-name="network.name_long"
      :close="toggleSwapError"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Browser from 'webextension-polyfill';
import CloseIcon from '@action/icons/common/close-icon.vue';
import SwapArrows from '@action/icons/swap/swap-arrows.vue';
import BaseButton from '@action/components/base-button/index.vue';
import SwapTokenAmountInput from './components/swap-token-amount-input/index.vue';
import SwapTokenToAmount from './components/swap-token-to-amount/index.vue';
import AssetsSelectList from './components/swap-assets-select-list.vue';
import NetworkSelectList from './components/swap-network-select/network-select-list.vue';
import SwapLooking from './components/swap-loading/index.vue';
import SwapErrorPopup from './components/swap-error/index.vue';
import SendAddressInput from './components/send-address-input.vue';
import SendContactsList from './components/send-contacts-list.vue';
import { getAccountsByNetworkName } from '@/libs/utils/accounts';
import { AccountsHeaderData } from '../../types/account';
import { getNetworkByName } from '@/libs/utils/networks';
import { BaseNetwork } from '@/types/base-network';
import BigNumber from 'bignumber.js';
import { SubstrateNetwork } from '@/providers/polkadot/types/substrate-network';
import { EnkryptAccount, NetworkNames } from '@enkryptcom/types';
import { SwapError } from './components/swap-error/types';
import { routes as RouterNames } from '@/ui/action/router';
import getUiPath from '@/libs/utils/get-ui-path';
import UIRoutes from '@/ui/provider-pages/enkrypt/routes/names';
import { ProviderName } from '@/types/provider';
import EnkryptSwap, {
  type TokenType,
  type TokenTypeTo,
  WalletIdentifier,
  type SupportedNetworkName,
  isSupportedNetwork,
  getNetworkInfoByName,
  type NetworkInfo,
  sortByRank,
  SwapToken,
  type ProviderQuoteResponse,
} from '@enkryptcom/swap';
import Web3Eth from 'web3-eth';
import { toBN } from 'web3-utils';
import { NATIVE_TOKEN_ADDRESS } from '@/providers/ethereum/libs/common';
import { SWAP_LOADING, SwapData } from './types';
import SwapNetworkSelect from './components/swap-network-select/index.vue';
import { fromBase, toBase } from '@enkryptcom/utils';
import { debounce } from 'lodash';
import MarketData from '@/libs/market-data';
import { ProviderResponseWithStatus } from './types';
import { GenericNameResolver, CoinType } from '@/libs/name-resolver';
import { trackSwapEvents } from '@/libs/metrics';
import { SwapEventType } from '@/libs/metrics/types';
import { Connection } from '@solana/web3.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = (..._args: any[]) => {};
// Use this debug instead to enable debug logging
// const debug = console.debug.bind(console);

type BN = ReturnType<typeof toBN>;

const router = useRouter();
const route = useRoute();
const nameResolver = new GenericNameResolver();
const props = defineProps({
  network: { type: Object as PropType<BaseNetwork>, default: () => ({}) },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const selected: string = route.params.id as string;

const fromTokens = ref<TokenType[]>();
const fromToken = ref<TokenType | null>({
  name: 'Loading',
  symbol: '',
  decimals: 18,
  address: '',
  logoURI: props.network.icon,
  type: '' as any,
});
const fromAmount = ref<string | null>(null);
const toNetworks = ref<NetworkInfo[]>([]);
const toNetwork = ref<NetworkInfo | null>(null);
const toNetworkOpen = ref(false);
const toToken = ref<TokenTypeTo | null>(null);
const toTokens = ref<TokenTypeTo[]>([]);
const toAmount = ref<string>('');
const trendingToTokens = ref<TokenTypeTo[]>([]);
const swapError = ref<SwapError>();
const showSwapError = ref(false);
const LoadingType = ref<SWAP_LOADING>(SWAP_LOADING.LOADING);
const isFindingRate = ref(false);
const toAddressInputMeta = ref({
  displayAddress: (address: string) => address,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  identicon: (address: string) => '' as string,
  networkName: '',
});
const errors = ref({ inputAmount: '', noProviders: false });
const bestProviderQuotes = ref<ProviderQuoteResponse[]>([]);

/** Receiver address (address that will be receiving the swap output) */
const address = ref<string>('');

/** Is the receiver address valid */
const addressIsValid = ref(true);

const isOpenSelectContact = ref<boolean>(false);
const addressInput = ref();
const toAccounts = ref<EnkryptAccount[]>([]);

const fetchingTokens = ref(true);

const fromSelectOpened = ref(false);
const toSelectOpened = ref(false);

const isLooking = ref(false);

const swapMax = ref(false);

let api: Web3Eth | Connection;
switch (props.network.name) {
  case NetworkNames.Solana:
    api = new Connection(props.network.node);
    break;
  default:
    // Assume EVM
    api = new Web3Eth(props.network.node);
    break;
}

const swap = new EnkryptSwap({
  api,
  network: props.network.name as unknown as SupportedNetworkName,
  walletIdentifier: WalletIdentifier.enkrypt,
  evmOptions: { infiniteApproval: true },
});

onMounted(async () => {
  trackSwapEvents(SwapEventType.SwapOpen, { network: props.network.name });
  if (
    !isSupportedNetwork(props.network.name as unknown as SupportedNetworkName)
  ) {
    swapError.value = SwapError.NETWORK_NOT_SUPPORTED;
    toggleSwapError();
    return;
  }
  isLooking.value = true;
  props.network
    .getAllTokenInfo(props.accountInfo.selectedAccount?.address as string)
    .then(async tokens => {
      await swap.initPromise;
      let swapFromTokens = swap.getFromTokens();
      const tokensWithBalance: Record<string, string> = {};
      tokens.forEach(t => {
        if (
          toBN(t.balance).gtn(0) ||
          t.contract === NATIVE_TOKEN_ADDRESS ||
          !t.contract
        )
          tokensWithBalance[t.contract || NATIVE_TOKEN_ADDRESS] = t.balance;
      });
      swapFromTokens = {
        all: swapFromTokens.all.filter(t => {
          if (tokensWithBalance[t.address]) {
            t.balance = toBN(tokensWithBalance[t.address]);
            return true;
          }
          return false;
        }),
        top: swapFromTokens.top.filter(t => {
          if (tokensWithBalance[t.address]) {
            t.balance = toBN(tokensWithBalance[t.address]);
            return true;
          }
          return false;
        }),
        trending: swapFromTokens.trending.filter(t => {
          if (tokensWithBalance[t.address]) {
            t.balance = toBN(tokensWithBalance[t.address]);
            return true;
          }
          return false;
        }),
      };
      fromTokens.value = swapFromTokens.all;
      if (fromTokens.value.length) fromToken.value = fromTokens.value[0];

      const swapToTokens = swap.getToTokens();
      const supportedNetworks = Object.keys(swapToTokens.all);
      let thisNetwork: NetworkInfo;
      supportedNetworks.forEach(net => {
        const netInfo = getNetworkInfoByName(net as SupportedNetworkName);
        if (props.network.name === net) {
          thisNetwork =
            swapToTokens.all[net as unknown as SupportedNetworkName].length ===
            1
              ? getNetworkInfoByName(
                  NetworkNames.Ethereum as unknown as SupportedNetworkName,
                )
              : netInfo;
        }
        toNetworks.value.push(netInfo);
      });
      toNetworks.value.sort(sortByRank);
      if (!thisNetwork!) {
        swapError.value = SwapError.TEMP_NOT_SUPPORTED;
        toggleSwapError();
        return;
      }
      await initToNetworkInfo(thisNetwork!);
      setToTokens();
      isLooking.value = false;
    });
});
const defaultBNVals: Record<number, BN> = {};
const setToTokens = () => {
  const swapToTokens = swap.getToTokens();
  trendingToTokens.value = [];
  toToken.value = null;
  const MAX_TRENDING = 5;
  // Remove the source token from the list of destination tokens
  toTokens.value = swapToTokens.all[toNetwork.value!.id].filter(val => {
    if (!defaultBNVals[val.decimals])
      defaultBNVals[val.decimals] = toBN(toBase('1', val.decimals));
    val.balance = defaultBNVals[val.decimals];
    return (
      (toNetwork.value!.id as string) !== (props.network.name as string) ||
      val.address !== fromToken.value?.address
    );
  });

  if (swapToTokens.trending[toNetwork.value!.id])
    trendingToTokens.value.push(
      ...swapToTokens.trending[toNetwork.value!.id].slice(0, MAX_TRENDING),
    );
  if (
    swapToTokens.top[toNetwork.value!.id] &&
    trendingToTokens.value.length < MAX_TRENDING
  ) {
    trendingToTokens.value.push(
      ...swapToTokens.top[toNetwork.value!.id].slice(
        0,
        MAX_TRENDING - trendingToTokens.value.length,
      ),
    );
  }
  const existingtrending: string[] = [];
  trendingToTokens.value = trendingToTokens.value.filter(val => {
    if (!defaultBNVals[val.decimals])
      defaultBNVals[val.decimals] = toBN(toBase('1', val.decimals));
    val.balance = defaultBNVals[val.decimals];
    const isInTrending = existingtrending.includes(val.address);
    existingtrending.push(val.address);
    return (
      ((toNetwork.value!.id as string) !== (props.network.name as string) ||
        val.address !== fromToken.value?.address) &&
      !isInTrending
    );
  });
  if (toTokens.value.length === 1) toToken.value = toTokens.value[0];

  getAccountsByNetworkName(toNetwork.value!.id as unknown as NetworkNames).then(
    accounts => {
      toAccounts.value = accounts;
      const currentAccount = accounts.find(
        a => a.address === props.accountInfo.selectedAccount!.address,
      );
      if (currentAccount) {
        address.value = currentAccount.address;
        isValidToAddress();
      } else if (accounts.length) {
        address.value = accounts[0].address;
        isValidToAddress();
      }
    },
  );
};

const setMax = () => {
  fromAmount.value = new SwapToken(fromToken.value!).getBalanceReadable();
};

const inputAddress = (text: string) => {
  const debounceResolve = debounce(() => {
    nameResolver
      .resolveName(
        text,
        [props.network.name as CoinType, 'ETH'],
        props.network.provider as string,
      )
      .then(resolved => {
        if (resolved) {
          inputAddress(resolved);
        }
      });
  }, 500);
  if (text.includes('.')) debounceResolve();
  try {
    address.value = toAddressInputMeta.value.displayAddress(text);
  } catch {
    address.value = text;
  }
  isValidToAddress();
};

const toggleSelectContact = () => {
  isOpenSelectContact.value = !isOpenSelectContact.value;
};

/**
 * Check whether the receiver address is a valid on the network
 *
 * If it is then asynchronously refresh the quote
 */
const isValidToAddress = debounce(() => {
  addressIsValid.value = true;
  if (!address.value) addressIsValid.value = false;
  else {
    try {
      const converted = toAddressInputMeta.value.displayAddress(address.value);
      toToken.value?.networkInfo
        .isAddress(converted)
        .then(receiverAddressIsValid => {
          addressIsValid.value = receiverAddressIsValid;
          if (receiverAddressIsValid) checkUpdateQuote();
        });
    } catch (e) {
      addressIsValid.value = false;
    }
  }
}, 200);

/** Native currency on the source network */
const nativeSwapToken = computed(() => {
  const nToken = fromTokens.value?.find(
    ft => ft.address === NATIVE_TOKEN_ADDRESS,
  );
  if (nToken) return new SwapToken(nToken);
  return undefined;
});

/**
 * Choose the best deal from a list of swap providers' quotes
 *
 * Update the quote list and dest asset amount based
 */
const pickBestQuote = (fromAmountBN: BN, quotes: ProviderQuoteResponse[]) => {
  if (toToken.value == null) {
    debug(
      '[swap/index.vue] Skipping quote picking: no destination token amount selected yet',
    );
    return;
  }

  errors.value.inputAmount = '';

  // No quotes at all
  if (!quotes.length) return;

  const fromT = new SwapToken(fromToken.value!);

  /** Users would-be balance of the source asset after the swap, excluding fees */
  const remainingBalance =
    fromT.token.address === NATIVE_TOKEN_ADDRESS
      ? nativeSwapToken.value!.getBalanceRaw().sub(fromAmountBN)
      : nativeSwapToken.value!.getBalanceRaw();

  // Drop quotes that don't fit the users desired "amount"

  /** Quotes that the user can affort & fit their desired source amount */
  const filteredQuotes = quotes.filter(q => {
    return (
      // Must be swapping enough tokens
      q.minMax.minimumFrom.lte(fromAmountBN) &&
      // Must not be swapping too many tokens
      q.minMax.maximumFrom.gte(fromAmountBN) &&
      // Must be able to afford the fees
      q.additionalNativeFees.lte(remainingBalance)
    );
  });
  if (!filteredQuotes.length) {
    // User can't afford any quotes or none fit their requirements
    // Show a message in the UI describing why
    let lowestMinimum: BN = quotes[0].minMax.minimumFrom;
    let highestMaximum: BN = quotes[0].minMax.maximumFrom;
    let smallestNativeFees: BN = nativeSwapToken.value!.getBalanceRaw();
    // Note: this would show the fee instead of your balance as the required missing amount
    // let smallestNativeFees: BN = quotes[0].additionalNativeFees;

    // Loop through each quote to figure out the min and max swap src bounds
    // and the smallest possible native fees
    quotes.forEach(q => {
      // Minimum lower bound
      if (q.minMax.minimumFrom.lt(lowestMinimum)) {
        lowestMinimum = q.minMax.minimumFrom;
      }
      // Maximum upper bound
      if (q.minMax.maximumFrom.gt(highestMaximum)) {
        highestMaximum = q.minMax.maximumFrom;
      }
      // Minimum briding fees / rent fees / etc
      // set smallest fee to q.additionalNativeFees if it's smaller than the current smallest or if smallest is 0
      if (
        !q.additionalNativeFees.eqn(0) &&
        q.additionalNativeFees.lt(smallestNativeFees)
      ) {
        smallestNativeFees = q.additionalNativeFees;
      }
    });
    if (fromAmountBN.lt(lowestMinimum)) {
      errors.value.inputAmount = `Amount too low`;
    } else if (fromAmountBN.gt(highestMaximum)) {
      // Swapping too many tokens
      errors.value.inputAmount = `Maximum amount: ${fromT.toReadable(
        highestMaximum,
      )} ${nativeSwapToken.value!.token.symbol}`;
    } else if (smallestNativeFees.gt(remainingBalance)) {
      // Can't afford the fees
      errors.value.inputAmount = `Insufficient Bridging fees: ~${fromT
        .toReadable(smallestNativeFees)
        .substring(0, 10)} ${nativeSwapToken.value!.token.symbol} required`;
    }

    return;
  }

  // check for more errors outside of filteredQuotes not being empty
  if (fromAmountBN.gt(fromT.getBalanceRaw())) {
    errors.value.inputAmount = 'Insufficient funds';
  }

  // Sort remaining quotes descending by the amount of the dest asset to be received
  // i.e. best deal first
  filteredQuotes.sort((a, b) => (b.toTokenAmount.gt(a.toTokenAmount) ? 1 : -1));

  // Apply the results
  // NOTE: toToken.value is sometimes not defined here? (it's null)
  toAmount.value = new SwapToken(toToken.value!).toReadable(
    filteredQuotes[0].toTokenAmount,
  );
  bestProviderQuotes.value = filteredQuotes;
  isFindingRate.value = false;
};

/** Used to cancel the request to avoid race conditions */
const updateQuoteContext = {
  current: {
    /** context id */
    id: 0,
    /** context aborter */
    aborter: new AbortController(),
  },
};

function checkUpdateQuote() {
  if (
    fromToken.value &&
    toToken.value &&
    fromAmount.value &&
    !isNaN(fromAmount.value as any) &&
    Number(fromAmount.value) > 0
  ) {
    updateQuote();
  } else {
    isFindingRate.value = false;
    toAmount.value = '';
  }
}

/**
 * Request quotes from all swap providers & pick the best one
 */
const updateQuote = () => {
  isFindingRate.value = true;
  toAmount.value = '';
  bestProviderQuotes.value = [];
  errors.value.noProviders = false;
  const token = new SwapToken(fromToken.value!);
  if (fromAmount.value == null) {
    // User probably set a destination token before setting a "from" amount
    debug('[swap/index.vue] Skipping quote update: no source token amount set');
    return;
  }
  let fromRawAmount: BN;
  try {
    fromRawAmount = token.toRaw(fromAmount.value!);
  } catch (err) {
    console.warn(
      `Failed to convert amount to raw: ${err}` +
        `  fromAmount.value=${fromAmount.value} (${typeof fromAmount.value})`,
    );
    throw err;
  }
  trackSwapEvents(SwapEventType.SwapRate, {
    network: props.network.name,
    fromToken: fromToken.value!.name,
    toToken: toToken.value!.name,
  });
  if (!toToken.value) {
    console.warn('No destination token selected yet, yet requesting a quote??');
  }

  // Abort the previous execution. Used to avoid race conditions in the UI and
  // rapid pointless updates in succession when multiple requests are in-flight.
  // AbortSignal gives the swap provider the abiltiy to cancel network requests
  // and exit early.
  updateQuoteContext.current.aborter.abort();
  // Setup a new abortable context
  const context = {
    id: updateQuoteContext.current.id + 1,
    aborter: new AbortController(),
  };
  updateQuoteContext.current = context;
  debug(`[swap/index.vue] Starting quote update  id=${context.id}`);

  swap
    .getQuotes(
      {
        amount: fromRawAmount,
        fromAddress: props.network.displayAddress(
          props.accountInfo.selectedAccount!.address,
        ),
        fromToken: fromToken.value!,
        toToken: toToken.value!,
        toAddress: toAddressInputMeta.value.displayAddress(address.value),
      },
      { signal: context.aborter.signal },
    )
    .then(quotes => {
      // Overidden by new update, drop these quotes
      if (context.aborter.signal.aborted) {
        debug(
          `[swap/index.vue] Dropping quotes due to new update  id=${context.id}`,
        );
        return;
      }

      if (quotes.length) {
        debug(
          `[swap/index.vue] Found ${quotes.length} quotes  id=${context.id}`,
        );
        pickBestQuote(fromRawAmount, quotes);
      } else {
        debug(`[swap/index.vue] No quotes  id=${context.id}`);
        isFindingRate.value = false;
        errors.value.noProviders = true;
      }
    })
    .catch(err => {
      // Context aborted, just ignore the error
      if (err === context.aborter.signal.reason) {
        debug(
          `[swap/index.vue] Ignoring error due to quote request context abort  id=${context.id}`,
        );
        return;
      }
      throw err;
    });
};

// Whenever the token types or amounts change, update the quote (within a
// debounce)
watch([fromToken, toToken, fromAmount], debounce(checkUpdateQuote, 300));

const selectTokenFrom = (token: TokenType | TokenTypeTo) => {
  fromToken.value = token as TokenType;
  fromAmount.value = '';
  errors.value.inputAmount = '';
  toggleFromToken();
  setToTokens();
};

const initToNetworkInfo = async (network: NetworkInfo) => {
  await getNetworkByName(network.id).then(net => {
    if (net) {
      toAddressInputMeta.value = {
        displayAddress: net.displayAddress,
        identicon: net.identicon,
        networkName: network.name,
      };
    } else {
      toAddressInputMeta.value = {
        displayAddress: (address: string) => address,
        identicon: () => '',
        networkName: network.name,
      };
    }
  });
  toNetwork.value = network;
  inputAddress('');
};

const selectToNetwork = (network: NetworkInfo) => {
  toAccounts.value = [];
  address.value = '';
  toggleToNetwork();
  initToNetworkInfo(network).then(() => {
    setToTokens();
  });
};

const selectTokenTo = (token: TokenTypeTo | TokenType) => {
  toToken.value = token as TokenTypeTo;
  isValidToAddress();
  toSelectOpened.value = false;
};

const inputAmountFrom = async (newVal: string) => {
  fromAmount.value = newVal;
  swapMax.value = false;
  errors.value.inputAmount = '';
};
const selectAccount = (account: string) => {
  address.value = account;
  isValidToAddress();
  isOpenSelectContact.value = false;
};

const toggleToNetwork = () => {
  toNetworkOpen.value = !toNetworkOpen.value;
};

const toggleFromToken = () => {
  fromSelectOpened.value = !fromSelectOpened.value;
};

const toggleToToken = () => {
  toSelectOpened.value = !toSelectOpened.value;
};

const toggleLooking = () => {
  isLooking.value = !isLooking.value;
};

const toggleSwapError = () => {
  showSwapError.value = !showSwapError.value;
  if (
    (swapError.value === SwapError.NETWORK_NOT_SUPPORTED ||
      swapError.value === SwapError.TEMP_NOT_SUPPORTED) &&
    !showSwapError.value
  ) {
    router.go(-1);
  }
};

const sendButtonTitle = computed(() => {
  if (!fromAmount.value || fromAmount.value === '0' || errors.value.inputAmount)
    return 'Enter valid amount';
  if (!toToken.value) return 'Select To Token';
  if (!address.value || !addressIsValid.value) return 'Enter address';
  return 'Preview swap';
});

const isDisabled = computed(() => {
  if (!fromToken.value!.balance) return true;
  if (!fromAmount.value || fromAmount.value === '0' || errors.value.inputAmount)
    return true;
  if (
    BigNumber(fromAmount.value).gt(
      fromBase(fromToken.value!.balance!.toString(), fromToken.value!.decimals),
    )
  )
    return true;
  if (!toToken.value) return true;
  if (!address.value || !addressIsValid.value) return true;
  if (!bestProviderQuotes.value.length) return true;
  return false;
});

const sendAction = async () => {
  toggleLooking();
  const marketData = new MarketData();
  let fromPrice: null | number;
  if (!fromToken.value!.cgId) {
    console.warn(
      `Source token ${fromToken.value!.symbol} (${fromToken.value!.name})` +
        ` ${fromToken.value!.address} has no CoinGecko ID, setting price` +
        ` to 0`,
    );
    fromPrice = 0;
  } else {
    fromPrice = await marketData
      .getMarketData([fromToken.value!.cgId])
      .then(res => res[0]!.current_price);
  }
  let toPrice: null | number;
  if (!toToken.value!.cgId) {
    console.warn(
      `Destination token ${toToken.value!.symbol} (${toToken.value!.name})` +
        ` ${toToken.value!.address} has no CoinGecko ID, setting price` +
        ` to 0`,
    );
    toPrice = 0;
  } else {
    toPrice = await marketData
      .getMarketData([toToken.value!.cgId])
      .then(res => res[0]!.current_price);
  }
  const localFromToken = { ...fromToken.value! };
  const localToToken = { ...toToken.value! };
  localFromToken.price = fromPrice ?? undefined;
  localToToken.price = toPrice ?? undefined;
  localFromToken.balance = bestProviderQuotes.value[0]!.fromTokenAmount;
  localToToken.balance = bestProviderQuotes.value[0]!.toTokenAmount;
  const swapToToken = new SwapToken(localToToken);
  const swapFromToken = new SwapToken(localFromToken);
  const priceDifference = BigNumber(swapFromToken.getFiatTotal())
    .div(swapToToken.getFiatTotal())
    .toString();
  const tradePromises = bestProviderQuotes.value.map(q =>
    swap.getSwap(q.quote),
  );
  const trades: (ProviderResponseWithStatus | null)[] = await Promise.all(
    tradePromises,
  ).then(responses => responses.filter(r => !!r));
  const tradeStatusOptions = trades.map(t =>
    t!.getStatusObject({ transactions: [] }),
  );
  const statusObjects = await Promise.all(tradeStatusOptions);
  trades.forEach((t, idx) => (t!.status = statusObjects[idx]));
  if (!trades.length) {
    swapError.value = SwapError.NO_TRADES;
    toggleLooking();
    toggleSwapError();
    return;
  }
  const swapData: SwapData = {
    trades: trades as ProviderResponseWithStatus[],
    fromToken: localFromToken,
    toToken: localToToken,
    priceDifference: priceDifference,
    nativeBalance: nativeSwapToken.value!.getBalanceRaw() || toBN('0'),
    nativePrice: nativeSwapToken.value!.getFiatValue() || 0,
    existentialDeposit:
      (props.network as SubstrateNetwork).existentialDeposit || toBN('0'),
    fromAddress: props.accountInfo.selectedAccount!.address,
    toAddress: address.value,
  };
  const routedRoute = router.resolve({
    name: RouterNames.swapBestOffer.name,
    query: {
      id: selected,
      swapData: Buffer.from(JSON.stringify(swapData), 'utf8').toString(
        'base64',
      ),
    },
  });
  if (props.accountInfo.selectedAccount!.isHardware) {
    await Browser.windows.create({
      url: Browser.runtime.getURL(
        getUiPath(
          `${UIRoutes.swapVerifyHW.path}?id=${routedRoute.query.id}&swapData=${routedRoute.query.swapData}`,
          ProviderName.enkrypt,
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

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;
}

.swap {
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
    top: 16px;
    right: 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__wrap {
    padding: 0 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    height: calc(~'100% - 172px');
  }

  &__arrows {
    padding: 8px 0;
    text-align: center;
    font-size: 0;
    display: block;
    text-decoration: none;
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    background-color: @white;

    &-cancel {
      width: 140px;
    }

    &-send {
      width: 248px;
    }
  }

  .send-address-input {
    margin: 8px 0 8px 0;
    width: 100%;
  }
}
</style>

<style lang="less">
.swap {
  .send-contacts-list__wrap {
    top: 482px;
    max-height: 114px;
    padding: 0;
  }

  .send-contacts-list__scroll-area {
    max-height: 114px;
    padding: 8px;
    box-sizing: border-box;

    h3 {
      display: none;
    }

    .ps__rail-y {
      right: 3px !important;
    }
  }

  .send-contacts-list__buttons {
    display: none;
  }
}
</style>
