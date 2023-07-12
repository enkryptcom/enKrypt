<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
      <div class="send-transaction__header">
        <h3>Send</h3>
        <a class="send-transaction__close" @click="close">
          <close-icon />
        </a>
      </div>

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
        :accounts="accountInfo.activeAccounts"
        :address="addressFrom"
        :network="network"
        :identicon="network.identicon"
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
        :accounts="accountInfo.activeAccounts"
        :network="network"
        :address="addressTo"
        @selected:account="selectAccountTo"
        @update:paste-from-clipboard="addressInputTo.pasteFromClipboard()"
        @close="toggleSelectContactTo"
      />

      <send-token-select
        :token="selectedAsset"
        @update:toggle-token-select="toggleSelectToken"
      />

      <assets-select-list
        v-show="isOpenSelectToken"
        :is-send="true"
        :assets="accountAssets"
        :is-loading="isLoadingAssets"
        @close="toggleSelectToken"
        @update:select-asset="selectToken"
      />

      <send-input-amount
        :amount="amount"
        :fiat-value="selectedAsset.price"
        :has-enough-balance="hasEnough"
        @update:input-amount="inputAmount"
        @update:input-set-max="setSendMax"
      />

      <send-fee-select
        v-if="!edWarn"
        :fee="fee ?? { nativeSymbol: props.network.name }"
      />

      <send-alert v-if="edWarn" />

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :no-background="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle"
            :click="sendAction"
            :disabled="isDisabled"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { debounce } from "lodash";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "./components/send-contacts-list.vue";
import SendFromContactsList from "./components/send-from-contacts-list.vue";
import SendTokenSelect from "./components/send-token-select.vue";
import AssetsSelectList from "@action/views/assets-select-list/index.vue";
import SendInputAmount from "./components/send-input-amount.vue";
import SendFeeSelect from "./components/send-fee-select.vue";
import SendAlert from "./components/send-alert.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SubstrateApi from "@/providers/polkadot/libs/api";
import { ApiPromise } from "@polkadot/api";
import { AccountsHeaderData } from "@action/types/account";
import { GasFeeInfo } from "@/providers/ethereum/ui/types";
import { SubstrateNetwork } from "../../types/substrate-network";
import { toBN } from "web3-utils";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import { fromBase, toBase, isValidDecimals } from "@enkryptcom/utils";
import BigNumber from "bignumber.js";
import { VerifyTransactionParams } from "../types";
import { routes as RouterNames } from "@/ui/action/router";
import { SendOptions } from "@/types/base-token";
import { SubstrateToken } from "../../types/substrate-token";
import { SubstrateNativeToken } from "../../types/substrate-native-token";
import Browser from "webextension-polyfill";
import getUiPath from "@/libs/utils/get-ui-path";
import { ProviderName } from "@/types/provider";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { GenericNameResolver, CoinType } from "@/libs/name-resolver";

const props = defineProps({
  network: {
    type: Object as PropType<SubstrateNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const route = useRoute();
const router = useRouter();
const nameResolver = new GenericNameResolver();

const addressInputTo = ref();
const addressInputFrom = ref();
const isOpenSelectContactFrom = ref(false);
const isOpenSelectContactTo = ref(false);
const addressFrom = ref(props.accountInfo.selectedAccount!.address);
const addressTo = ref("");
const isOpenSelectToken = ref(false);
const amount = ref<string>();
const fee = ref<GasFeeInfo | null>(null);
const accountAssets = ref<SubstrateToken[]>([]);
const selectedAsset = ref<SubstrateToken | Partial<SubstrateToken>>(
  new SubstrateNativeToken({
    icon: props.network.icon,
    balance: "0",
    price: "0",
    name: "loading",
    symbol: "loading",
    decimals: 12,
  })
);
const hasEnough = ref(false);
const sendMax = ref(false);

const selected: string = route.params.id as string;
const isLoadingAssets = ref(true);

const edWarn = computed(() => {
  if (!fee.value) {
    return undefined;
  }

  if (!amount.value) {
    return false;
  }

  if (!isValidDecimals(amount.value ?? "0", selectedAsset.value.decimals!)) {
    return false;
  }

  const rawAmount = toBN(
    toBase(amount.value.toString(), selectedAsset.value.decimals ?? 0)
  );
  const ed = selectedAsset.value.existentialDeposit ?? toBN(0);
  const userBalance = toBN(selectedAsset.value.balance ?? 0);

  if (!sendMax.value && userBalance.sub(rawAmount).lte(ed)) {
    return true;
  }

  const txFee = toBN(
    toBase(fee.value.nativeValue, selectedAsset.value.decimals!)
  );
  if (!sendMax.value && userBalance.sub(txFee).sub(rawAmount).lt(ed)) {
    return true;
  } else {
    return false;
  }
});

const isAddress = computed(() => {
  try {
    polkadotEncodeAddress(addressTo.value);
    return true;
  } catch {
    return false;
  }
});

onMounted(() => {
  isLoadingAssets.value = true;
  fetchTokens();
});

const validateFields = async () => {
  if (selectedAsset.value && isAddress.value) {
    if (!isValidDecimals(amount.value || "0", selectedAsset.value.decimals!)) {
      hasEnough.value = false;
      return;
    }

    const api = (await props.network.api()).api as ApiPromise;
    await api.isReady;

    let rawAmount = toBN(
      toBase(
        amount.value ? amount.value.toString() : "0",
        selectedAsset.value.decimals!
      )
    );

    const sendOptions: SendOptions | undefined = sendMax.value
      ? { type: "all" }
      : undefined;

    const tx = await selectedAsset.value.send!(
      api,
      addressTo.value,
      rawAmount.toString(),
      sendOptions
    );
    const { partialFee } = (
      await tx.paymentInfo(props.accountInfo.selectedAccount!.address)
    ).toJSON();
    const rawFee = toBN(partialFee?.toString() ?? "0");
    const rawBalance = toBN(selectedAsset.value.balance!);
    if (
      sendMax.value &&
      selectedAsset.value.name === accountAssets.value[0].name
    ) {
      rawAmount = rawAmount.sub(rawFee);
      if (rawAmount.gtn(0)) {
        amount.value = fromBase(
          rawAmount.toString(),
          selectedAsset.value.decimals!
        );
      }
    }
    if (rawAmount.ltn(0) || rawAmount.add(rawFee).gt(rawBalance)) {
      hasEnough.value = false;
    } else {
      hasEnough.value = true;
    }

    const nativeAsset = accountAssets.value[0];
    const txFeeHuman = fromBase(
      partialFee?.toString() ?? "",
      nativeAsset.decimals!
    );

    const txPrice = new BigNumber(nativeAsset.price!).times(txFeeHuman);

    fee.value = {
      fiatSymbol: "USD",
      fiatValue: txPrice.toString(),
      nativeSymbol: nativeAsset.symbol ?? "",
      nativeValue: txFeeHuman.toString(),
    };
  }
};
watch([selectedAsset, addressTo], validateFields);

watch(addressFrom, () => {
  fetchTokens();
});

const fetchTokens = async () => {
  const networkApi = (await props.network.api()) as SubstrateApi;
  const networkAssets = await props.network.getAllTokens(addressFrom.value);
  const pricePromises = networkAssets.map((asset) => asset.getLatestPrice());
  const balancePromises = networkAssets.map((asset) => {
    if (!asset.balance) {
      return asset.getLatestUserBalance(networkApi.api, addressFrom.value);
    }

    return Promise.resolve(asset.balance);
  });

  Promise.all([...pricePromises, ...balancePromises]).then(() => {
    const nonZeroAssets = networkAssets.filter(
      (asset) => !toBN(asset.balance ?? "0").isZero()
    );

    if (nonZeroAssets.length == 0) {
      nonZeroAssets.push(networkAssets[0]);
    }

    selectedAsset.value = nonZeroAssets[0];
    accountAssets.value = nonZeroAssets;

    isLoadingAssets.value = false;
  });
};

const close = () => {
  router.go(-1);
};

const inputAddressFrom = (text: string) => {
  addressFrom.value = text;
};

const inputAddressTo = (text: string) => {
  const debounceResolve = debounce(() => {
    nameResolver
      .resolveName(text, [props.network.name as CoinType, "DOT", "KSM"])
      .then((resolved) => {
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
};

const selectAccountTo = (account: string) => {
  addressTo.value = account;
  isOpenSelectContactTo.value = false;
};

const selectToken = (token: SubstrateToken | Partial<SubstrateToken>) => {
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (number: string | undefined) => {
  sendMax.value = false;
  amount.value = number ? (parseFloat(number) < 0 ? "0" : number) : number;
  validateFields();
};

const sendButtonTitle = computed(() => {
  let title = "Send";
  if (parseInt(amount.value ?? "0") > 0)
    title =
      "Send " +
      formatFloatingPointValue(amount.value!).value +
      " " +
      selectedAsset.value?.symbol!.toUpperCase();
  return title;
});

const setSendMax = (max: boolean) => {
  if (!max) {
    sendMax.value = false;
    return;
  }

  if (selectedAsset.value) {
    const humanBalance = fromBase(
      selectedAsset.value.balance!,
      selectedAsset.value.decimals!
    );
    amount.value = humanBalance;
    validateFields();
    sendMax.value = true;
  }
};

const isDisabled = computed(() => {
  let isDisabled = true;

  let addressIsValid = false;

  try {
    props.network.displayAddress(addressTo.value);
    addressIsValid = true;
  } catch {
    addressIsValid = false;
  }

  if (
    amount.value !== undefined &&
    amount.value !== "" &&
    hasEnough.value &&
    addressIsValid &&
    !edWarn.value &&
    edWarn.value !== undefined
  )
    isDisabled = false;
  return isDisabled;
});

const sendAction = async () => {
  const sendAmount = toBase(amount.value!, selectedAsset.value.decimals!);

  const sendOptions: SendOptions | undefined = sendMax.value
    ? { type: "all" }
    : undefined;

  const api = (await props.network.api()).api as ApiPromise;
  await api.isReady;

  const tx = await selectedAsset.value?.send!(
    api,
    addressTo.value,
    sendAmount,
    sendOptions
  );
  const keyring = new PublicKeyRing();
  const fromAccount = await keyring.getAccount(
    polkadotEncodeAddress(addressFrom.value)
  );
  const txVerifyInfo: VerifyTransactionParams = {
    TransactionData: {
      from: fromAccount.address,
      to: addressTo.value,
      data: tx.toHex() as `0x{string}`,
      value: amount.value!,
    },
    toToken: {
      amount: toBase(amount.value!, selectedAsset.value.decimals!),
      decimals: selectedAsset.value.decimals!,
      icon: selectedAsset.value.icon as string,
      symbol: selectedAsset.value.symbol || "unknown",
      valueUSD: new BigNumber(selectedAsset.value.price || "0")
        .times(amount.value!)
        .toFixed(),
      name: selectedAsset.value.name || "",
      price: selectedAsset.value.price || "0",
    },
    fromAddress: fromAccount.address,
    fromAddressName: fromAccount.name,
    txFee: fee.value!,
    toAddress: addressTo.value,
  };

  const routedRoute = router.resolve({
    name: RouterNames.verify.name,
    query: {
      id: selected,
      txData: Buffer.from(JSON.stringify(txVerifyInfo), "utf8").toString(
        "base64"
      ),
    },
  });

  if (fromAccount.isHardware) {
    await Browser.windows.create({
      url: Browser.runtime.getURL(
        getUiPath(
          `dot-hw-verify?id=${routedRoute.query.id}&txData=${routedRoute.query.txData}`,
          ProviderName.polkadot
        )
      ),
      type: "popup",
      focused: true,
      height: 600,
      width: 460,
    });
  } else {
    router.push(routedRoute);
  }
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

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
    top: 20px;
    right: 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

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
