<template>
  <div class="rename-account-form__container">
    <div class="rename-account-form__overlay" @click="close"></div>
    <div class="rename-account-form">
      <h3>Rename account</h3>

      <div class="rename-account-form__input" :class="{ focus: isFocus }">
        <img :src="network.identicon(account.address || '')" />
        <input
          ref="renameAccountInput"
          v-model="accountName"
          type="text"
          placeholder="Account name"
          autocomplete="off"
          autofocus
          @focus="changeFocus"
          @blur="changeFocus"
        />
      </div>

      <p>
        Example: Private funds, Savings account, dApp account, Work funds,
        Airdrops
      </p>

      <div class="rename-account-form__buttons">
        <div class="rename-account-form__buttons-cancel">
          <base-button title="Cancel" :click="close" :no-background="true" />
        </div>
        <div class="rename-account-form__buttons-send">
          <base-button
            title="Rename account"
            :click="renameAccount"
            :disabled="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, onMounted } from "vue";
import BaseButton from "@action/components/base-button/index.vue";
import { NodeType } from "@/types/provider";
import { EnkryptAccount } from "@enkryptcom/types";

const isFocus = ref(false);
const accountName = ref("");
const renameAccountInput = ref(null);

defineExpose({ renameAccountInput });

const props = defineProps({
  close: {
    type: Function,
    default: () => ({}),
  },
  network: {
    type: Object as PropType<NodeType>,
    default: () => ({}),
  },
  account: {
    type: Object as PropType<EnkryptAccount>,
    default: () => ({}),
  },
});
onMounted(() => {
  if (renameAccountInput.value) {
    (renameAccountInput.value as HTMLInputElement).focus();
  }
});
const changeFocus = () => {
  isFocus.value = !isFocus.value;
};
const close = () => {
  props.close();
};
const renameAccount = () => {
  console.log("renameAccount");
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.rename-account-form {
  background: @white;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039), 0px 7px 24px rgba(0, 0, 0, 0.19);
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
  width: 344px;
  height: auto;
  z-index: 107;
  position: relative;

  &__container {
    width: 800px;
    height: 600px;
    left: -340px;
    top: 0px;
    position: fixed;
    z-index: 105;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

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
      border-radius: 50%;
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
