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
        :input="inputAddress"
        :toggle-select="toggleSelectContact"
        :value="address"
        :identicon="identicon"
      ></send-address-input>

      <send-contacts-list
        :show-accounts="isOpenSelectContact"
        :close="toggleSelectContact"
        :select-account="selectAccount"
        :active-network="props.network"
        :accounts="accounts"
        :identicon="identicon"
      ></send-contacts-list>

      <send-token-select
        :token="selectedToken"
        :toggle-select="toggleSelectToken"
        :api="api"
        :active-account="props.accountInfo.selectedAccount!.address"
      ></send-token-select>

      <send-token-list
        :show-tokens="isOpenSelectToken"
        :close="toggleSelectToken"
        :select-token="selectToken"
        :active-account="props.accountInfo.selectedAccount!.address"
        :api="api"
        :assets="userAssets"
      >
      </send-token-list>

      <send-input-amount
        :input="inputAmount"
        :value="amount"
      ></send-input-amount>

      <send-fee-select v-if="fee" :fee="fee"></send-fee-select>

      <send-alert v-if="edWarn"></send-alert>

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :gray="true" />
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
import { computed, onMounted, PropType, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "./components/send-contacts-list.vue";
import SendTokenSelect from "./components/send-token-select.vue";
import SendTokenList from "./components/send-token-list.vue";
import SendInputAmount from "./components/send-input-amount.vue";
import SendFeeSelect from "./components/send-fee-select.vue";
import SendAlert from "./components/send-alert.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { BaseToken } from "@/types/base-token";
import EvmAPI from "@/providers/ethereum/libs/api";
import { ApiPromise } from "@polkadot/api";
import { Account, AccountsHeaderData } from "@action/types/account";
import { GasFeeInfo } from "@/providers/ethereum/ui/types";
import { SubstrateNetwork } from "../../types/substrate-network";
import { toBase } from "@/libs/utils/units";
import { toBN } from "web3-utils";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";

const route = useRoute();
const router = useRouter();

const isOpenSelectContact = ref(false);
const address = ref("");
const isOpenSelectToken = ref(false);
const selectedToken = ref<BaseToken | undefined>();
const amount = ref("0");
const fee = ref<GasFeeInfo | null>(null);
const edWarn = ref(false);
const accounts = ref<Account[]>([]);
const identicon = ref<((address: string) => string) | undefined>();
const userAssets = ref<BaseToken[]>([]);
const api = ref<EvmAPI | ApiPromise>();

const selected: string = route.params.id as string;

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

onMounted(async () => {
  const networkAssets = props.network.getAllTokens();
  console.log(networkAssets);
  selectedToken.value = networkAssets[0];
  userAssets.value = networkAssets;
  const networkApi = await props.network.api();
  await networkApi.init();
  api.value = networkApi.api;
});

// watch([selectedToken, amount, address], async () => {
//   if (selectedToken.value && amount.value && address.value && api.value) {
//     const rawAmount = toBN(
//       toBase(amount.value.toString(), selectedToken.value.decimals)
//     );

//     const tx = await selectedToken.value.send(
//       api.value,
//       address.value,
//       rawAmount.toString()
//     );
//     const { partialFee } = (
//       await tx.paymentInfo(props.accountInfo.selectedAccount!.address)
//     ).toJSON();

//     fee.value = {
//       fiatSymbol: "USD",
//       fiatValue: "0",
//       nativeSymbol: "DOT",
//       nativeValue: "0",
//     };

//     const txFee = toBN(partialFee);
//     const ed = selectedToken.value.existentialDeposit ?? toBN(0);
//     const userBalance = toBN(
//       await selectedToken.value.getUserBalance(
//         api.value,
//         props.accountInfo.selectedAccount!.address
//       )
//     );
//     if (userBalance.sub(txFee).sub(rawAmount).lt(ed)) {
//       edWarn.value = true;
//     } else {
//       edWarn.value = false;
//     }
//   }
// });

const close = () => {
  router.go(-1);
};

const inputAddress = (text: string) => {
  address.value = text;
};

const toggleSelectContact = (open: boolean) => {
  isOpenSelectContact.value = open;
};

const toggleSelectToken = (open: boolean) => {
  isOpenSelectToken.value = open;
};

const selectAccount = (account: Account) => {
  address.value = account.address;
  isOpenSelectContact.value = false;
};

const selectToken = (token: BaseToken) => {
  selectedToken.value = token;
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
      selectedToken.value?.symbol!.toUpperCase();
  return title;
});

const isDisabled = () => {
  let isDisabled = true;
  if (parseInt(amount.value) > 0) isDisabled = false;
  return isDisabled;
};

const sendAction = () => {
  router.push({ name: "verify-transaction", params: { id: selected } });
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
