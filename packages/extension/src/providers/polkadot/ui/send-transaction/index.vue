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
        ref="addressInput"
        :value="address"
        :identicon="identicon"
        @update:input-address="inputAddress"
        @toggle:show-contacts="toggleSelectContact"
      ></send-address-input>

      <send-contacts-list
        :show-accounts="isOpenSelectContact"
        :active-network="props.network"
        :account-info="accountInfo"
        :identicon="identicon"
        @selected:account="selectAccount"
        @update:paste-from-clipboard="addressInput.pasteFromClipboard()"
        @close="toggleSelectContact"
      ></send-contacts-list>

      <send-token-select
        :token="selectedAsset"
        @update:toggle-token-select="toggleSelectToken"
      ></send-token-select>

      <assets-select-list
        v-show="isOpenSelectToken"
        :is-send="true"
        :assets="accountAssets"
        @close="toggleSelectToken"
        @update:select-asset="selectToken"
      ></assets-select-list>

      <send-input-amount
        :amount="amount"
        :fiat-value="selectedAsset.value"
        :has-enough-balance="hasEnough"
        @update:input-amount="inputAmount"
        @update:input-set-max="setSendMax()"
      ></send-input-amount>

      <send-fee-select v-if="fee" :fee="fee"></send-fee-select>

      <send-alert v-if="edWarn"></send-alert>

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :no-background="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle"
            :click="sendAction"
            :disabled="isDisabled()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendTransaction",
};
</script>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "./components/send-contacts-list.vue";
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
import { stringToHex, toBN } from "web3-utils";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import createIcon from "../../libs/blockies";
import { AssetsType } from "@/types/provider";
import { toBase } from "@/libs/utils/units";
import BigNumber from "bignumber.js";
import { VerifyTransactionParams } from "../types";

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
const identicon = createIcon;

const addressInput = ref();
const isOpenSelectContact = ref(false);
const address = ref("");
const isOpenSelectToken = ref(false);
const amount = ref("0");
const fee = ref<GasFeeInfo | null>(null);
const edWarn = ref(false);
const api = shallowRef<SubstrateApi>();
const accountAssets = ref<AssetsType[]>([]);
const selectedAsset = ref<AssetsType | Partial<AssetsType>>({
  icon: props.network.icon,
  balancef: "0.00",
  balanceUSDf: "0.00",
  value: "0",
  name: "loading",
  decimals: 18,
});
const hasEnough = ref(true);
const sendMax = ref(false);

const selected: string = route.params.id as string;

onMounted(async () => {
  props.accountInfo.activeAccounts.forEach((account) => {
    account.address = props.network.displayAddress(account.address);
  });
  const networkAssets = await props.network.getAllTokenInfo(
    props.accountInfo.selectedAccount?.address ?? ""
  );
  selectedAsset.value = networkAssets[0];
  accountAssets.value = networkAssets;
  const networkApi = await props.network.api();
  await networkApi.init();
  api.value = networkApi as SubstrateApi;
});

watch([selectedAsset, amount, address], async () => {
  if (selectedAsset.value && amount.value && address.value && api.value) {
    await api.value.api.isReady;
    const rawAmount = toBN(
      toBase(amount.value.toString(), selectedAsset.value.decimals!)
    );

    const rawBalance = toBN(selectedAsset.value.balance!);

    if (rawAmount.gt(rawBalance)) {
      hasEnough.value = false;
    } else {
      hasEnough.value = true;
    }

    const tx = await selectedAsset.value.baseToken!.send(
      api.value.api,
      address.value,
      rawAmount.toString()
    );
    const { partialFee } = (
      await tx.paymentInfo(props.accountInfo.selectedAccount!.address)
    ).toJSON();

    const txFee = toBN(partialFee);
    const txFeeHuman = new BigNumber(partialFee).div(
      new BigNumber(10 ** selectedAsset.value.decimals!)
    );
    const txPrice = new BigNumber(selectedAsset.value.value!).times(txFeeHuman);

    fee.value = {
      fiatSymbol: "USD",
      fiatValue: txPrice.toString(),
      nativeSymbol: selectedAsset.value.symbol ?? "",
      nativeValue: txFeeHuman.toString(),
    };

    const ed = selectedAsset.value.baseToken!.existentialDeposit ?? toBN(0);
    const userBalance = toBN(selectedAsset.value.balance ?? 0);
    if (
      !userBalance.eq(rawAmount) &&
      userBalance.sub(txFee).sub(rawAmount).lt(ed)
    ) {
      edWarn.value = true;
    } else {
      edWarn.value = false;
    }
  }
});

const close = () => {
  router.go(-1);
};

const inputAddress = (text: string) => {
  address.value = text;
};

const toggleSelectContact = (open: boolean) => {
  isOpenSelectContact.value = open;
};

const toggleSelectToken = () => {
  isOpenSelectToken.value = !isOpenSelectToken.value;
};

const selectAccount = (account: string) => {
  address.value = account;
  isOpenSelectContact.value = false;
};

const selectToken = (token: AssetsType | Partial<AssetsType>) => {
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (number: string) => {
  amount.value = number;
};

const sendButtonTitle = computed(() => {
  let title = "Send";
  if (parseInt(amount.value) > 0)
    title =
      "Send " +
      formatFloatingPointValue(amount.value).value +
      " " +
      selectedAsset.value?.symbol!.toUpperCase();
  return title;
});

const setSendMax = () => {
  if (selectedAsset.value) {
    const humanBalance = new BigNumber(selectedAsset.value.balance!).div(
      10 ** selectedAsset.value.decimals!
    );

    amount.value = humanBalance.toString();
    sendMax.value = true;
  }
};

const isDisabled = () => {
  let isDisabled = true;

  let addressIsValid = false;

  try {
    props.network.displayAddress(address.value);
    addressIsValid = true;
  } catch {
    addressIsValid = false;
  }

  if (hasEnough.value && addressIsValid) isDisabled = false;
  return isDisabled;
};

const sendAction = async () => {
  const sendAmount = new BigNumber(amount.value)
    .times(
      new BigNumber(10).pow(
        new BigNumber(selectedAsset.value.baseToken!.decimals)
      )
    )
    .toString();

  await api.value?.api.isReady;
  const tx = await selectedAsset.value.baseToken?.send(
    api.value!.api as ApiPromise,
    address.value,
    sendAmount
  );

  const txVerifyInfo: VerifyTransactionParams = {
    TransactionData: {
      chainName: stringToHex(props.network.name_long) as `0x{string}`,
      from: stringToHex(
        props.accountInfo.selectedAccount!.address
      ) as `0x{string}`,
      to: stringToHex(address.value) as `0x{string}`,
      data: tx.toHex() as `0x{string}`,
      value: stringToHex(amount.value) as `0x{string}`,
    },
    toToken: {
      amount: amount.value,
      icon: selectedAsset.value.icon as string,
      symbol: selectedAsset.value.symbol || "unknown",
      valueUSD: new BigNumber(selectedAsset.value.value || "0")
        .times(amount.value)
        .toString(),
    },
    fromAddress: props.accountInfo.selectedAccount!.address,
    fromAddressName: props.accountInfo.selectedAccount!.name,
    txFee: fee.value!,
    toAddress: address.value,
  };

  router.push({
    name: "verify-transaction",
    params: { id: selected, txData: JSON.stringify(txVerifyInfo) },
  });
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
