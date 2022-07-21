<template>
  <div>
    <div class="add-network__inner-header">
      <a class="add-network__back" @click="back()">
        <arrow-back />
      </a>
      <h3>Custom network</h3>

      <a class="settings__close" @click="close()">
        <close-icon />
      </a>
    </div>

    <div class="add-network__custom-block">
      <label-input
        type="text"
        label="Network name"
        class="add-network__custom-input"
        placeholder="Type name"
        :value="nameValue"
        @update:value="nameChanged"
      />
    </div>

    <div class="add-network__custom-block">
      <label-input
        type="text"
        label="New RPC URL"
        class="add-network__custom-input"
        placeholder="domain.url"
        :value="prcURLValue"
        @update:value="prcURLChanged"
      />
    </div>

    <div class="add-network__custom-block double">
      <label-input
        type="text"
        label="Chain ID"
        class="add-network__custom-input"
        placeholder="Text"
        :value="chainIDValue"
        @update:value="chainIDChanged"
      />

      <label-input
        type="text"
        label="Currency Symbol"
        class="add-network__custom-input"
        placeholder="Symbol"
        :value="symbolValue"
        @update:value="symbolChanged"
      />
    </div>

    <div class="add-network__custom-block">
      <label-input
        type="text"
        label="Block Explorer URL (Optional)"
        class="add-network__custom-input"
        placeholder="domain.url"
        :value="blockURLValue"
        @update:value="blockURLChanged"
      />
    </div>

    <div class="add-network__custom-button">
      <base-button
        title="Add network"
        :click="sendAction"
        :disabled="!isValid"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, computed } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import ArrowBack from "@action/icons/common/arrow-back.vue";
import LabelInput from "@action/components/label-input/index.vue";
import BaseButton from "@action/components/base-button/index.vue";

let nameValue = ref<string>("");
let prcURLValue = ref<string>("");
let chainIDValue = ref<string>("");
let symbolValue = ref<string>("");
let blockURLValue = ref<string>("");

const isValid = computed<boolean>(() => {
  return nameValue.value.length > 0;
});

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  back: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});

const nameChanged = (newVal: string) => {
  nameValue.value = newVal;
};
const prcURLChanged = (newVal: string) => {
  prcURLValue.value = newVal;
};
const symbolChanged = (newVal: string) => {
  symbolValue.value = newVal;
};
const chainIDChanged = (newVal: string) => {
  chainIDValue.value = newVal;
};
const blockURLChanged = (newVal: string) => {
  blockURLValue.value = newVal;
};
const sendAction = () => {
  console.log("add network");
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.add-network {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__inner-header {
    width: 100%;
    height: 56px;
    background: @white;
    box-sizing: border-box;
    padding: 14px 56px 14px 56px;
    margin-bottom: 32px;

    h3 {
      font-style: normal;
      font-weight: bold;
      font-size: 20px;
      line-height: 28px;
      margin: 0;
      color: @primaryLabel;
      text-align: center;
    }
  }

  &__back {
    position: absolute;
    top: 8px;
    left: 8px;
    border-radius: 8px;
    cursor: pointer;
    padding: 8px;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__custom {
    &-block {
      padding: 0 32px 16px 32px;

      &.double {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
        .add-network__custom-input {
          margin-right: 6px;

          &:last-child {
            margin-right: 0;
            margin-left: 6px;
          }
        }
      }
    }

    &-button {
      padding: 24px 32px 24px 32px;
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      box-sizing: border-box;
    }
  }
}
</style>
