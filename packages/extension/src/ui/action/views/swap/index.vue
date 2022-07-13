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
          ></swap-token-amount-input>

          <a class="swap__arrows" @click="swapTokens"
            ><swap-arrows></swap-arrows
          ></a>

          <swap-token-amount-input
            :toggle-select="toggleToToken"
            :token="toToken"
            :input-amount="inputAmountTo"
            :select-token="selectTokenTo"
          ></swap-token-amount-input>

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
      @close="toggleFromToken"
      @update:select-asset="selectTokenFrom"
    ></assets-select-list>

    <assets-select-list
      v-show="toSelectOpened"
      :is-select-to-token="true"
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
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SwapArrows from "@action/icons/swap/swap-arrows.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SwapTokenAmountInput from "./components/swap-token-amount-input/index.vue";
import AssetsSelectList from "@action/views/assets-select-list/index.vue";
import SwapLooking from "./components/swap-looking/index.vue";
import { AssetsType } from "@/types/provider";
import SendAddressInput from "@/providers/ethereum/ui/send-transaction/components/send-address-input.vue";
import SendContactsList from "@/providers/ethereum/ui/send-transaction/components/send-contacts-list.vue";
import { AccountsHeaderData } from "../../types/account";
import { SignerType } from "@enkryptcom/types";
import { getNetworkByName } from "@/libs/utils/networks";

const ethereum: AssetsType = {
  name: "Ethereum",
  symbol: "eth",
  icon: "https://mpolev.ru/enkrypt/eth.png",
  balance: "0.5",
  balancef: "0.5",
  balanceUSD: 2500,
  balanceUSDf: "$2500",
  value: "100",
  valuef: "100",
  decimals: 1000,
  sparkline: "",
  priceChangePercentage: 0,
};
const address = ref<string>("");
const isOpenSelectContact = ref<boolean>(false);
const addressInput = ref();
const accountHeaderData = ref<AccountsHeaderData>({
  activeAccounts: [
    {
      address: "0x99999990d598b918799f38163204bbc30611b6b6",
      basePath: "m/44'/60'/1'/0",
      name: "fake account #1",
      pathIndex: 0,
      publicKey: "0x0",
      type: SignerType.secp256k1,
    },
    {
      address: "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea391",
      basePath: "m/44'/60'/1'/1",
      name: "fake account #3",
      pathIndex: 0,
      publicKey: "0x0",
      type: SignerType.secp256k1,
    },
  ],
  inactiveAccounts: [],
  selectedAccount: {
    address: "0x99999990d598b918799f38163204bbc30611b6b6",
    basePath: "m/44'/60'/1'/0",
    name: "fake account #1",
    pathIndex: 0,
    publicKey: "0x0",
    type: SignerType.secp256k1,
  },
  activeBalances: [],
});

const router = useRouter();
const route = useRoute();

const selected: string = route.params.id as string;
const network = getNetworkByName(selected);

let fromToken = ref<AssetsType | null>(ethereum);
let fromAmount = ref<number | null>(null);

let toToken = ref<AssetsType | null>(null);
let toAmount = ref<number | null>(null);

let fromSelectOpened = ref(false);
let toSelectOpened = ref(false);

let isLooking = ref(false);

const selectTokenFrom = (token: AssetsType) => {
  fromToken.value = token;
  fromSelectOpened.value = false;
};
const selectTokenTo = (token: AssetsType) => {
  toToken.value = token;
  toSelectOpened.value = false;
};
const inputAmountFrom = (newVal: number) => {
  fromAmount.value = newVal;
};
const inputAmountTo = (newVal: number) => {
  toAmount.value = newVal;
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
    Number(toAmount.value) > 0
  ) {
    isDisabled = false;
  }
  return isDisabled;
};
const sendAction = () => {
  toggleLooking();

  setTimeout(() => {
    router.push({
      name: "swap-best-offer",
      params: { id: selected },
    });
  }, 3000);
};
const swapTokens = () => {
  const tokenTo = fromToken.value;
  const amountTo = fromAmount.value;

  const tokenFrom = toToken.value;
  const amountFrom = toAmount.value;

  fromToken.value = tokenFrom;
  fromAmount.value = amountFrom;

  toToken.value = tokenTo;
  toAmount.value = amountTo;
};
const inputAddress = (text: string) => {
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
