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
        :toggleSelect="toggleSelectContact"
        :value="address"
      ></send-address-input>

      <send-contacts-list
        :showAccounts="isOpenSelectContact"
        :close="toggleSelectContact"
        :selectAccount="selectAccount"
      ></send-contacts-list>

      <send-token-select
        :token="selectedToken"
        :toggleSelect="toggleSelectToken"
      ></send-token-select>

      <send-token-list
        :showTokens="isOpenSelectToken"
        :close="toggleSelectToken"
        :selectToken="selectToken"
      >
      </send-token-list>

      <send-input-amount
        :input="inputAmount"
        :value="amount"
      ></send-input-amount>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendTransaction",
};
</script>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "./components/send-contacts-list.vue";
import SendTokenSelect from "./components/send-token-select.vue";
import SendTokenList from "./components/send-token-list.vue";
import SendInputAmount from "./components/send-input-amount.vue";
import { Account } from "@action/types/account";
import { Token } from "@action/types/token";
import { ethereum } from "@action/types/mock";

const route = useRoute();
const router = useRouter();

let isOpenSelectContact = ref(false);
let address = ref("");
let isOpenSelectToken = ref(false);
let selectedToken = ref(ethereum);
let amount = ref(0);

const selected: number = +route.params.networkId;
const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};

defineProps({});

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
}
</style>
