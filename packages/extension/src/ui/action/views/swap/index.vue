<template>
  <div>
    <div class="container">
      <div v-if="!!selected" class="swap">
        <div class="swap__header">
          <h3>Swap</h3>
          <a class="swap__close" @click="$router.go(-1)">
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
              @click="$router.go(-1)"
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
      v-if="toNetworkOpen"
      :assets="toNetworks"
      @close="toggleToNetwork"
      @update:select-asset="selectToNetwork"
    />

    <assets-select-list
      v-if="fromSelectOpened"
      :assets="fromTokens"
      @close="toggleFromToken"
      @update:select-asset="selectTokenFrom"
    />

    <assets-select-list
      v-show="toSelectOpened"
      :is-select-to-token="true"
      :assets="toTokens"
      :is-loading="fetchingTokens"
      @close="toggleToToken"
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
import { computed, onMounted, PropType, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Browser from "webextension-polyfill";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SwapArrows from "@action/icons/swap/swap-arrows.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SwapTokenAmountInput from "./components/swap-token-amount-input/index.vue";
import SwapTokenToAmount from "./components/swap-token-to-amount/index.vue";
import AssetsSelectList from "./components/swap-assets-select-list.vue";
import NetworkSelectList from "./components/swap-network-select/network-select-list.vue";
import SwapLooking from "./components/swap-loading/index.vue";
import SwapErrorPopup from "./components/swap-error/index.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "./components/send-contacts-list.vue";
import { AccountsHeaderData } from "../../types/account";
import { getNetworkByName } from "@/libs/utils/networks";
import { BaseNetwork } from "@/types/base-network";
import BigNumber from "bignumber.js";
import { SubstrateNetwork } from "@/providers/polkadot/types/substrate-network";
import { EnkryptAccount, NetworkNames } from "@enkryptcom/types";
import { SwapError } from "./components/swap-error/types";
import { routes as RouterNames } from "@/ui/action/router";
import getUiPath from "@/libs/utils/get-ui-path";
import UIRoutes from "@/ui/provider-pages/enkrypt/routes/names";
import { ProviderName } from "@/types/provider";
import EnkryptSwap, {
  TokenType,
  TokenTypeTo,
  WalletIdentifier,
  SupportedNetworkName,
  isSupportedNetwork,
  getNetworkInfoByName,
  NetworkInfo,
  sortByRank,
  SwapToken,
  ProviderQuoteResponse,
} from "@enkryptcom/swap";
import Web3Eth from "web3-eth";
import { toBN } from "web3-utils";
import { NATIVE_TOKEN_ADDRESS } from "@/providers/ethereum/libs/common";
import { SWAP_LOADING, SwapData } from "./types";
import SwapNetworkSelect from "./components/swap-network-select/index.vue";
import { toBase } from "@enkryptcom/utils";
import { debounce } from "lodash";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import MarketData from "@/libs/market-data";
import { ProviderResponseWithStatus } from "./types";

type BN = ReturnType<typeof toBN>;

const router = useRouter();
const route = useRoute();

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

const selected: string = route.params.id as string;

const fromTokens = ref<TokenType[]>();
const fromToken = ref<TokenType | null>({
  name: "Loading",
  symbol: "",
  decimals: 18,
  address: "",
  logoURI: props.network.icon,
  type: "" as any,
});
const fromAmount = ref<string | null>(null);
const toNetworks = ref<NetworkInfo[]>([]);
const toNetwork = ref<NetworkInfo | null>(null);
const toNetworkOpen = ref(false);
const toToken = ref<TokenTypeTo | null>(null);
const toTokens = ref<TokenTypeTo[]>([]);
const toAmount = ref<string>("");
const trendingToTokens = ref<TokenTypeTo[]>([]);
const swapError = ref<SwapError>();
const showSwapError = ref(false);
const LoadingType = ref<SWAP_LOADING>(SWAP_LOADING.LOADING);
const isFindingRate = ref(false);
const toAddressInputMeta = ref({
  displayAddress: (address: string) => address,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  identicon: (address: string) => "" as string,
  networkName: "",
});
const errors = ref({
  inputAmount: "",
  noProviders: false,
});
const bestProviderQuotes = ref<ProviderQuoteResponse[]>([]);

const address = ref<string>("");
const addressIsValid = ref(true);
const isOpenSelectContact = ref<boolean>(false);
const addressInput = ref();
const toAccounts = ref<EnkryptAccount[]>([]);

const fetchingTokens = ref(true);

const fromSelectOpened = ref(false);
const toSelectOpened = ref(false);

const isLooking = ref(false);

const swapMax = ref(false);

const swap = new EnkryptSwap({
  api: new Web3Eth(props.network.node),
  network: props.network.name as unknown as SupportedNetworkName,
  walletIdentifier: WalletIdentifier.enkrypt,
  evmOptions: {
    infiniteApproval: true,
  },
});
const keyring = new PublicKeyRing();
onMounted(async () => {
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
    .then(async (tokens) => {
      await swap.initPromise;
      let swapFromTokens = await swap.getFromTokens();
      const tokensWithBalance: Record<string, string> = {};
      tokens.forEach((t) => {
        if (
          toBN(t.balance).gtn(0) ||
          t.contract === NATIVE_TOKEN_ADDRESS ||
          !t.contract
        )
          tokensWithBalance[t.contract || NATIVE_TOKEN_ADDRESS] = t.balance;
      });
      swapFromTokens = {
        all: swapFromTokens.all.filter((t) => {
          if (tokensWithBalance[t.address]) {
            t.balance = toBN(tokensWithBalance[t.address]);
            return true;
          }
          return false;
        }),
        top: swapFromTokens.top.filter((t) => {
          if (tokensWithBalance[t.address]) {
            t.balance = toBN(tokensWithBalance[t.address]);
            return true;
          }
          return false;
        }),
        trending: swapFromTokens.trending.filter((t) => {
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
      supportedNetworks.forEach((net) => {
        const netInfo = getNetworkInfoByName(net as SupportedNetworkName);
        if (props.network.name === net) {
          thisNetwork =
            swapToTokens.all[net as unknown as SupportedNetworkName].length ===
            1
              ? getNetworkInfoByName(
                  NetworkNames.Ethereum as unknown as SupportedNetworkName
                )
              : netInfo;
        }
        toNetworks.value.push(netInfo);
      });
      toNetworks.value.sort(sortByRank);
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
  toTokens.value = swapToTokens.all[toNetwork.value!.id].filter((val) => {
    if (!defaultBNVals[val.decimals])
      defaultBNVals[val.decimals] = toBN(toBase("1", val.decimals));
    val.balance = defaultBNVals[val.decimals];
    return (
      (toNetwork.value!.id as string) !== (props.network.name as string) ||
      val.address !== fromToken.value?.address
    );
  });

  if (swapToTokens.trending[toNetwork.value!.id])
    trendingToTokens.value.push(
      ...swapToTokens.trending[toNetwork.value!.id].slice(0, MAX_TRENDING)
    );
  if (
    swapToTokens.top[toNetwork.value!.id] &&
    trendingToTokens.value.length < MAX_TRENDING
  ) {
    trendingToTokens.value.push(
      ...swapToTokens.top[toNetwork.value!.id].slice(
        0,
        MAX_TRENDING - trendingToTokens.value.length
      )
    );
  }
  const existingtrending: string[] = [];
  trendingToTokens.value = trendingToTokens.value.filter((val) => {
    if (!defaultBNVals[val.decimals])
      defaultBNVals[val.decimals] = toBN(toBase("1", val.decimals));
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
  keyring.getAccounts(toNetwork.value?.signerType).then((accounts) => {
    toAccounts.value = accounts;
    const currentAccount = accounts.find(
      (a) => a.address === props.accountInfo.selectedAccount!.address
    );
    if (currentAccount) {
      address.value = currentAccount.address;
      isValidToAddress();
    } else if (accounts.length) {
      address.value = accounts[0].address;
      isValidToAddress();
    }
  });
};

const setMax = () => {
  fromAmount.value = new SwapToken(fromToken.value!).getBalanceReadable();
};

const inputAddress = (text: string) => {
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

const isValidToAddress = debounce(() => {
  addressIsValid.value = true;
  if (!address.value) addressIsValid.value = false;
  else {
    try {
      const converted = toAddressInputMeta.value.displayAddress(address.value);
      toToken.value?.networkInfo.isAddress(converted).then((res) => {
        addressIsValid.value = res;
        if (res) updateQuote();
      });
    } catch (e) {
      addressIsValid.value = false;
    }
  }
}, 200);

const pickBestQuote = (fromAmountBN: BN, quotes: ProviderQuoteResponse[]) => {
  errors.value.inputAmount = "";
  if (!quotes.length) return;
  const token = new SwapToken(fromToken.value!);
  const filteredQuotes = quotes.filter((q) => {
    return (
      q.minMax.minimumFrom.lte(fromAmountBN) &&
      q.minMax.maximumFrom.gte(fromAmountBN)
    );
  });
  if (!filteredQuotes.length) {
    let lowestMinimum: BN = quotes[0].minMax.minimumFrom;
    let highestMaximum: BN = quotes[0].minMax.maximumFrom;
    quotes.forEach((q) => {
      if (q.minMax.minimumFrom.lt(lowestMinimum))
        lowestMinimum = q.minMax.minimumFrom;
      if (q.minMax.maximumFrom.gt(highestMaximum))
        highestMaximum = q.minMax.maximumFrom;
    });
    if (fromAmountBN.lt(lowestMinimum))
      errors.value.inputAmount = `Minimum amount: ${token.toReadable(
        lowestMinimum
      )}`;
    if (fromAmountBN.gt(highestMaximum))
      errors.value.inputAmount = `Maximum amount: ${token.toReadable(
        highestMaximum
      )}`;
    return;
  }
  const fromT = new SwapToken(fromToken.value!);
  if (fromT.getBalanceRaw().lt(fromAmountBN)) {
    errors.value.inputAmount = "Insufficient funds";
  }
  filteredQuotes.sort((a, b) => (b.toTokenAmount.gt(a.toTokenAmount) ? 1 : -1));
  toAmount.value = new SwapToken(toToken.value!).toReadable(
    filteredQuotes[0].toTokenAmount
  );
  bestProviderQuotes.value = filteredQuotes;
  isFindingRate.value = false;
};

const updateQuote = () => {
  isFindingRate.value = true;
  toAmount.value = "";
  bestProviderQuotes.value = [];
  errors.value.noProviders = false;
  const token = new SwapToken(fromToken.value!);
  const fromRawAmount = token.toRaw(fromAmount.value!);
  swap
    .getQuotes({
      amount: fromRawAmount,
      fromAddress: props.network.displayAddress(
        props.accountInfo.selectedAccount!.address
      ),
      fromToken: fromToken.value!,
      toToken: toToken.value!,
      toAddress: toAddressInputMeta.value.displayAddress(address.value),
    })
    .then((quotes) => {
      if (quotes.length) pickBestQuote(fromRawAmount, quotes);
      else {
        isFindingRate.value = false;
        errors.value.noProviders = true;
      }
    });
};

watch(
  [fromToken, toToken, fromAmount],
  debounce(async () => {
    if (
      fromToken.value &&
      toToken.value &&
      fromAmount.value &&
      !isNaN(((fromAmount.value || "") as any) && Number(fromAmount.value) > 0)
    ) {
      updateQuote();
    } else {
      isFindingRate.value = false;
      toAmount.value = "";
    }
  }, 300)
);

const selectTokenFrom = (token: TokenType | TokenTypeTo) => {
  fromToken.value = token as TokenType;
  fromAmount.value = "";
  errors.value.inputAmount = "";
  toggleFromToken();
  setToTokens();
};

const initToNetworkInfo = async (network: NetworkInfo) => {
  await getNetworkByName(network.id).then((net) => {
    if (net) {
      toAddressInputMeta.value = {
        displayAddress: net.displayAddress,
        identicon: net.identicon,
        networkName: network.name,
      };
    } else {
      toAddressInputMeta.value = {
        displayAddress: (address: string) => address,
        identicon: () => "",
        networkName: network.name,
      };
    }
  });
  toNetwork.value = network;
  inputAddress("");
};

const selectToNetwork = (network: NetworkInfo) => {
  toAccounts.value = [];
  address.value = "";
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
    swapError.value === SwapError.NETWORK_NOT_SUPPORTED &&
    !showSwapError.value
  ) {
    router.go(-1);
  }
};

const sendButtonTitle = computed(() => {
  if (!fromAmount.value || fromAmount.value === "0" || errors.value.inputAmount)
    return "Enter valid amount";
  if (!toToken.value) return "Select To Token";
  if (!address.value || !addressIsValid.value) return "Enter address";
  return "Preview swap";
});

const isDisabled = computed(() => {
  if (!fromAmount.value || fromAmount.value === "0" || errors.value.inputAmount)
    return true;
  if (!toToken.value) return true;
  if (!address.value || !addressIsValid.value) return true;
  if (!bestProviderQuotes.value.length) return true;
  return false;
});

const sendAction = async () => {
  toggleLooking();
  const marketData = new MarketData();
  const fromPrice = fromToken.value!.cgId
    ? await marketData
        .getMarketData([fromToken.value!.cgId])
        .then((res) => res[0]!.current_price)
    : 0;
  const toPrice = toToken.value!.cgId
    ? await marketData
        .getMarketData([toToken.value!.cgId])
        .then((res) => res[0]!.current_price)
    : 0;
  const localFromToken = { ...fromToken.value! };
  const localToToken = { ...toToken.value! };
  localFromToken.price = fromPrice;
  localToToken.price = toPrice;
  localFromToken.balance = bestProviderQuotes.value[0]!.fromTokenAmount;
  localToToken.balance = bestProviderQuotes.value[0]!.toTokenAmount;
  const swapToToken = new SwapToken(localToToken);
  const swapFromToken = new SwapToken(localFromToken);
  const priceDifference = BigNumber(swapFromToken.getFiatTotal())
    .div(swapToToken.getFiatTotal())
    .toString();

  const tradePromises = bestProviderQuotes.value.map((q) =>
    swap.getSwap(q.quote)
  );

  const trades: (ProviderResponseWithStatus | null)[] = await Promise.all(
    tradePromises
  ).then((responses) => responses.filter((r) => !!r));
  const tradeStatusOptions = trades.map((t) =>
    t!.getStatusObject({
      transactionHashes: [],
    })
  );
  const statusObjects = await Promise.all(tradeStatusOptions);
  trades.forEach((t, idx) => (t!.status = statusObjects[idx]));
  if (!trades.length) {
    swapError.value = SwapError.NO_TRADES;
    toggleLooking();
    toggleSwapError();
    return;
  }
  const nativeToken = fromTokens.value?.find(
    (ft) => ft.address === NATIVE_TOKEN_ADDRESS
  );
  const swapData: SwapData = {
    trades: trades as ProviderResponseWithStatus[],
    fromToken: localFromToken,
    toToken: localToToken,
    priceDifference: priceDifference,
    nativeBalance: nativeToken!.balance || toBN("0"),
    nativePrice: nativeToken!.price || 0,
    existentialDeposit:
      (props.network as SubstrateNetwork).existentialDeposit || toBN("0"),
    fromAddress: props.accountInfo.selectedAccount!.address,
    toAddress: address.value,
  };
  const routedRoute = router.resolve({
    name: RouterNames.swapBestOffer.name,
    query: {
      id: selected,
      swapData: Buffer.from(JSON.stringify(swapData), "utf8").toString(
        "base64"
      ),
    },
  });

  if (props.accountInfo.selectedAccount!.isHardware) {
    await Browser.windows.create({
      url: Browser.runtime.getURL(
        getUiPath(
          `${UIRoutes.swapVerifyHW.path}?id=${routedRoute.query.id}&swapData=${routedRoute.query.swapData}`,
          ProviderName.enkrypt
        )
      ),
      type: "popup",
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
@import "~@action/styles/theme.less";
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
    height: calc(~"100% - 172px");
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
