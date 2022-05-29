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
      ></send-address-input>

      <send-contacts-list
        :show-accounts="isOpenSelectContact"
        :close="toggleSelectContact"
        :select-account="selectAccount"
        :account-info="props.accountInfo"
      ></send-contacts-list>

      <send-token-select
        :token="selectedToken"
        :toggle-select="toggleSelectToken"
        :network="props.network"
        :account-info="props.accountInfo"
      ></send-token-select>

      <send-token-list
        :show-tokens="isOpenSelectToken"
        :close="toggleSelectToken"
        :select-token="selectToken"
        :network="props.network"
        :account-info="props.accountInfo"
      >
      </send-token-list>

      <send-input-amount
        :input="inputAmount"
        :value="amount"
        :account-info="props.accountInfo"
      ></send-input-amount>

      <send-fee-select
        :fee="fee"
        :toggle-select="toggleSelectFee"
      ></send-fee-select>

      <transaction-fee-view
        :show-fees="isOpenSelectFee"
        :close="toggleSelectFee"
        :select-fee="selectFee"
        :selected="fee.price.speed"
        :fee="fee"
        :fees="fees"
      ></transaction-fee-view>

      <!-- <send-alert></send-alert> -->

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :gray="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle()"
            :click="sendAction"
            :disabled="isDisabled"
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
import Web3 from "web3";
import { ref, onMounted, PropType, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "./components/send-contacts-list.vue";
import SendTokenSelect from "./components/send-token-select.vue";
import SendTokenList from "./components/send-token-list.vue";
import SendInputAmount from "./components/send-input-amount.vue";
import SendFeeSelect from "./components/send-fee-select.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
// import SendAlert from "./components/send-alert.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { Account } from "@action/types/account";
import { Token } from "@action/types/token";
import { TransactionFee } from "@action/types/fee";
import { ethereum } from "@action/types/mock";
import { AccountsHeaderData } from "@action/types/account";
import { NodeType } from "@/types/provider";
import { toBN, toWei } from "web3-utils";
import { getPriorityFeeBasedOnType } from "@/providers/ethereum/libs/transaction/gas-utils";
import { PRIORITIES, FEES } from "./template/fee";

const route = useRoute();
const router = useRouter();

const props = defineProps({
  network: {
    type: Object as PropType<NodeType>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

let web3: any;
let isOpenSelectContact = ref<boolean>(false);
let address = ref<string>("");
let isOpenSelectToken = ref<boolean>(false);
let selectedToken = ref(ethereum);
let amount = ref<number>(0);
let isOpenSelectFee = ref<boolean>(false);
let fees = ref<TransactionFee[]>([]);
let fee = ref<TransactionFee>({
  limit: 0.0001,
  price: {
    speed: 1,
    baseFee: 0,
    tip: 0,
    totalFee: 0,
    title: "Recommended",
    description: "Will reliably go through in most scenarios",
  },
});

const selected: string = route.params.id as string;

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

const selectToken = (token: Token) => {
  selectedToken.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (number: number) => {
  amount.value = number;
};

const toggleSelectFee = (open: boolean) => {
  isOpenSelectFee.value = open;
};

const selectFee = (option: TransactionFee) => {
  fee.value = option;
  isOpenSelectFee.value = false;
};

const getBaseFeePerGas = async () => {
  return await web3.eth.getBlockNumber().then((blockNum: any) => {
    return web3.eth
      .getBlock(blockNum, false)
      .then((block: any) => block.baseFeePerGas);
  });
};

const getGasPrice = async () => {
  return await web3.eth.getGasPrice();
};

const getPriorityFees = async () => {
  const gasPrice = await getGasPrice();
  const baseFeePerGas = await getBaseFeePerGas();

  for await (const priority of PRIORITIES) {
    const price = await getPriorityFeeBasedOnType(
      baseFeePerGas?.toString() as string,
      gasPrice.toString(),
      priority
    );

    fees.value.push({
      limit: 0.0001,
      price: {
        speed: FEES[priority].speed,
        baseFee: 0,
        tip: 0,
        totalFee: price,
        title: FEES[priority].title,
        description: FEES[priority].description,
      },
    });

    if (priority === 1) selectFee(fees.value[1]);
  }
  return fees;
};

const sendButtonTitle = () => {
  let title = "Send";

  if (amount.value > 0)
    title =
      "Send " + amount.value + " " + selectedToken.value.symbol.toUpperCase();

  return title;
};

const isDisabled = computed(() => {
  if (amount.value === 0) return true;
  const amountInWei = toWei(amount.value.toString());
  return !toBN(amountInWei).gt(toBN(0));
});

const sendAction = () => {
  router.push({
    name: "verify-transaction",
    params: {
      id: selected,
      fromAddress: props.accountInfo.selectedAccount?.address,
      address: address.value,
      selectedToken: selectedToken.value.toString(),
      amount: amount.value,
      fee: fee.value.toString(),
      network: props.network.toString(),
    },
  });
};

onMounted(async () => {
  web3 = await new Web3(props.network.node);
  await getPriorityFees();
});
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
