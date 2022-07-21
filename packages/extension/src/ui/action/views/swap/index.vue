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
            :toggle-select="toggleFromToken"
            :token="fromToken"
            :input-amount="inputAmountFrom"
            :autofocus="true"
            :min="minFrom"
            :max="maxFrom"
          ></swap-token-amount-input>

          <a class="swap__arrows" @click="swapTokens"
            ><swap-arrows></swap-arrows
          ></a>

          <swap-token-to-amount
            :toggle-select="toggleToToken"
            :token="toToken"
            :select-token="selectTokenTo"
            :is-finding-rate="isFindingRate"
            :amount="toAmount?.toString()"
          ></swap-token-to-amount>

          <send-address-input
            ref="addressInput"
            :value="address"
            :network="network"
            @update:input-address="inputAddress"
            @toggle:show-contacts="toggleSelectContact"
          ></send-address-input>

          <send-contacts-list
            :show-accounts="isOpenSelectContact"
            :account-info="accountHeaderData"
            :address="address"
            :network="network"
            @selected:account="selectAccount"
            @update:paste-from-clipboard="addressInput.pasteFromClipboard()"
            @close="toggleSelectContact"
          ></send-contacts-list>
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
              :title="sendButtonTitle()"
              :click="sendAction"
              :disabled="isDisabled()"
            />
          </div>
        </div>
      </div>
    </div>

    <assets-select-list
      v-show="fromSelectOpened"
      :assets="fromTokens"
      @close="toggleFromToken"
      @update:select-asset="selectTokenFrom"
    ></assets-select-list>

    <assets-select-list
      v-show="toSelectOpened"
      :is-select-to-token="true"
      :assets="toTokens"
      @close="toggleToToken"
      @update:select-asset="selectTokenTo"
    ></assets-select-list>

    <swap-looking v-show="isLooking" :close="toggleLooking"></swap-looking>
  </div>
</template>

<script lang="ts">
export default {
  name: "Swap",
};
</script>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SwapArrows from "@action/icons/swap/swap-arrows.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SwapTokenAmountInput from "./components/swap-token-amount-input/index.vue";
import SwapTokenToAmount from "./components/swap-token-to-amount/index.vue";
import AssetsSelectList from "@action/views/assets-select-list/index.vue";
import SwapLooking from "./components/swap-looking/index.vue";
import SendAddressInput from "@/providers/ethereum/ui/send-transaction/components/send-address-input.vue";
import SendContactsList from "@/providers/ethereum/ui/send-transaction/components/send-contacts-list.vue";
import { AccountsHeaderData } from "../../types/account";
import { getNetworkByName } from "@/libs/utils/networks";
import { BaseToken } from "@/types/base-token";
import { BaseNetwork } from "@/types/base-network";
import { Swap } from "@/providers/swap";
import BigNumber from "bignumber.js";
import { Rates } from "@/providers/swap/types/SwapProvider";
import { SubstrateNetwork } from "@/providers/polkadot/types/substrate-network";
import { UnknownToken } from "@/types/unknown-token";

const router = useRouter();
const route = useRoute();

const swap = new Swap();

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

const address = ref<string>("");
const isOpenSelectContact = ref<boolean>(false);
const addressInput = ref();
const accountHeaderData = ref<AccountsHeaderData>(props.accountInfo);

const selected: string = route.params.id as string;
const network = getNetworkByName(selected);

const fromTokens = ref<BaseToken[]>();
const fromToken = ref<BaseToken | null>(
  new UnknownToken({ name: "Loading", symbol: "", decimals: 18, icon: "" })
);
const fromAmount = ref<string | null>(null);

const toTokens = ref<BaseToken[]>();
const toToken = ref<BaseToken | null>(null);

const fromSelectOpened = ref(false);
const toSelectOpened = ref(false);

const isLooking = ref(false);

const rates = ref<Rates>();
const minFrom = ref<string>();
const maxFrom = ref<string>();
const inputError = ref(false);

const isFindingRate = computed(() => {
  if (rates.value) {
    return false;
  } else {
    return true;
  }
});

const getEstimateRate = computed(() => {
  if (rates.value) {
    if (rates.value.length === 1) {
      return (_x: number) => new BigNumber(rates.value![0].rate);
    }

    const x = rates.value.map(({ amount }) => new BigNumber(amount));
    const sumX = x.reduce((x1, x2) => x1.plus(x2), new BigNumber(0));
    const avgX = sumX.div(x.length);

    const xDifferencesToAverage = x.map((value) => avgX.minus(value));
    const xDifferencesToAverageSquared = xDifferencesToAverage.map((value) =>
      value.pow(2)
    );
    const SSxx = xDifferencesToAverageSquared.reduce(
      (prev, curr) => prev.plus(curr),
      new BigNumber(0)
    );

    const y = rates.value.map(({ rate }) => new BigNumber(rate));
    const sumY = y.reduce((y1, y2) => y1.plus(y2), new BigNumber(0));
    const avgY = sumY.div(y.length);
    const yDifferencesToAverage = y.map((value) => avgY.minus(value));
    const xAndYDifferencesMultiplied = xDifferencesToAverage.map(
      (curr, index) => curr.times(yDifferencesToAverage[index])
    );
    const SSxy = xAndYDifferencesMultiplied.reduce(
      (prev, curr) => prev.plus(curr),
      new BigNumber(0)
    );

    const slope = SSxy.div(SSxx);
    const intercept = avgY.minus(slope.times(avgX));

    return (x: number) => intercept.plus(slope.times(x));
  }

  return (_x: number) => new BigNumber(0);
});

const toAmount = computed(() => {
  const estimate = getEstimateRate
    .value(Number(fromAmount.value) ?? 0)
    .times(fromAmount.value ?? 0);

  if (estimate.isZero()) return "0";

  return estimate.toFixed();
});

onMounted(async () => {
  props.network
    .getAllTokens(props.accountInfo.selectedAccount?.address as string)
    .then((tokens) => {
      fromTokens.value = tokens;
      if (tokens.length > 0) {
        fromToken.value = tokens[0];
      }
    });

  swap
    .getAllTokens(props.network.name)
    // .then((tokens) =>
    //   tokens.sort((a, b) => {
    //     if (a.name > b.name) return 1;
    //     return -1;
    //   })
    // )
    .then((tokens) => {
      toTokens.value = tokens;
    });
});

watch([fromToken, toToken], () => {
  if (fromToken.value && toToken.value) {
    rates.value = undefined;
    swap
      .getTradePreview(props.network.name, fromToken.value, toToken.value)
      .then((preview) => {
        if (preview) {
          rates.value = preview.rates;
          minFrom.value = preview.min;
          maxFrom.value = preview.max;
        }
      });
  }
});

const selectTokenFrom = (token: BaseToken) => {
  fromToken.value = token;
  fromSelectOpened.value = false;
};
const selectTokenTo = (token: BaseToken) => {
  toToken.value = token;
  toSelectOpened.value = false;
};
const inputAmountFrom = async (newVal: number, isInvalid: boolean) => {
  inputError.value = isInvalid;
  fromAmount.value = newVal.toString();
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
const sendButtonTitle = () => {
  let title = "Select  token";

  if (!!fromToken.value && !!toToken.value) {
    title = "Preview swap";
  }

  return title;
};
const isDisabled = () => {
  let isDisabled = true;

  if (
    !!fromToken.value &&
    !!toToken.value &&
    Number(fromAmount.value) > 0 &&
    Number(toAmount.value) > 0 &&
    address.value !== "" &&
    !inputError.value
  ) {
    isDisabled = false;
  }
  return isDisabled;
};
const sendAction = async () => {
  toggleLooking();

  let fromAddress = props.accountInfo.selectedAccount!.address;

  if ((props.network as unknown as SubstrateNetwork).prefix !== undefined) {
    fromAddress = (props.network as unknown as SubstrateNetwork).displayAddress(
      fromAddress
    );
  }

  const trades = await swap.getTrade(
    props.network.name,
    fromAddress,
    address.value,
    fromToken.value!,
    toToken.value!,
    fromAmount.value!
  );

  if (trades.length === 0) {
    // TODO handle no trades
  }

  const swapData = {
    trades,
    toToken: toToken.value,
    fromToken: fromToken.value,
    fromAmount: fromAmount.value,
    toAddress: address.value,
  };

  router.push({
    name: "swap-best-offer",
    params: { id: selected, swapData: JSON.stringify(swapData) },
  });
};
const swapTokens = () => {
  const tokenTo = fromToken.value;
  const amountTo = fromAmount.value;

  const tokenFrom = toToken.value;
  const amountFrom = toAmount.value;

  fromToken.value = tokenFrom;
  fromAmount.value = amountFrom;

  toToken.value = tokenTo;
};
const inputAddress = (text: string) => {
  console.log(text);
  address.value = text;
};
const toggleSelectContact = (open: boolean) => {
  isOpenSelectContact.value = open;
};
const selectAccount = (account: string) => {
  address.value = account;
  isOpenSelectContact.value = false;
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
    cursor: pointer;
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
    padding: 8px 16px;
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
