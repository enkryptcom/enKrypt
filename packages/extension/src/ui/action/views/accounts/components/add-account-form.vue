<template>
  <div class="add-account-form">
    <h3>Add new {{ network.name_long }} account</h3>

    <div class="add-account-form__input" :class="{ focus: isFocus }">
      <img src="@/ui/action/icons/raw/account.png" />
      <input
        v-model="name"
        type="text"
        placeholder="Account name"
        @focus="changeFocus"
        @blur="changeFocus"
      />
    </div>

    <p>
      Example: Private funds, Savings account, dApp account, Work funds,
      Airdrops
    </p>

    <div class="add-account-form__buttons">
      <div class="add-account-form__buttons-cancel">
        <base-button title="Cancel" :click="close" :no-background="true" />
      </div>
      <div class="add-account-form__buttons-send">
        <base-button
          title="Add account"
          :click="createAccount"
          :disabled="isDisabled()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "AddAccountForm",
};
</script>

<script setup lang="ts">
import { defineProps, ref, PropType, onMounted } from "vue";
import BaseButton from "@action/components/base-button/index.vue";
import { NodeType } from "@/types/provider";
import KeyRing from "@/libs/keyring/public-keyring";

const kr = new KeyRing();
let isFocus = ref(false);
let name = ref("");
const allNames = ref<string[]>([]);

onMounted(async () => {
  allNames.value = (await kr.getAccounts()).map((acc) => acc.name);
});
const props = defineProps({
  close: {
    type: Function,
    default: () => ({}),
  },
  network: {
    type: Object as PropType<NodeType>,
    default: () => ({}),
  },
});

const changeFocus = () => {
  isFocus.value = !isFocus.value;
};

const close = () => {
  props.close();
};

const isDisabled = () => {
  let isDisabled = true;
  if (name.value.length > 3 && !allNames.value.includes(name.value))
    isDisabled = false;
  return isDisabled;
};

const createAccount = () => {
  kr.addAccount(name.value, props.network.signer[0]).then(close);
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.add-account-form {
  background: @white;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039), 0px 7px 24px rgba(0, 0, 0, 0.19);
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
  width: 344px;
  position: absolute;
  height: auto;
  max-height: 530px;
  left: 8px;
  top: 50px;

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 32px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @tertiaryLabel;
    padding: 0 16px;
    margin: 0 0 20px 0;
  }

  &__input {
    width: 312px;
    height: 56px;
    border: 2px solid @gray02;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    box-sizing: border-box;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    margin-bottom: 16px;

    &.focus {
      border: 2px solid @primary;
    }

    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }

    input {
      width: 100%;
      font-style: normal;
      font-weight: normal;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      border: 0 none;
      outline: none;
    }
  }

  &__buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;

    &-cancel {
      width: 132px;
    }

    &-send {
      width: 172px;
    }
  }
}
</style>
