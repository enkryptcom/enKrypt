<template>
  <a class="send-token-select" @click="open">
    <div class="send-token-select__image">
      <img :src="token ? token.icon : ''" alt="" />
    </div>
    <div class="send-token-select__info">
      <h5>{{ token ? token.name : "~" }}</h5>
      <p>
        {{
          tokenBalance
            ? $filters.formatFloatingPointValue(tokenBalance).value
            : "~"
        }}
        <span>{{ token ? token.symbol : "~" }}</span>
      </p>
    </div>

    <div class="send-token-select__arrow">
      <switch-arrow />
    </div>
  </a>
</template>

<script lang="ts">
export default {
  name: "SendTokenSelect",
};
</script>

<script setup lang="ts">
import { ref, onUpdated } from "vue";
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import { BaseToken } from "@/types/base-token";
import EvmAPI from "@/providers/ethereum/libs/api";
import { ApiPromise } from "@polkadot/api/promise/Api";
import { fromBase } from "@/libs/utils/units";

interface IProps {
  toggleSelect: (arg: any) => void;
  activeAccount?: string;
  token?: BaseToken;
  api?: EvmAPI | ApiPromise;
}

let isOpen = ref(false);

const props = defineProps<IProps>();

const tokenBalance = ref<string | undefined>();

onUpdated(async () => {
  if (props.api && props.token && props.activeAccount) {
    props.token
      .getUserBalance(props.api, props.activeAccount)
      .then((balance) => {
        tokenBalance.value = fromBase(balance, props.token!.decimals);
      });
  }
});

const open = () => {
  isOpen.value = !isOpen.value;
  props.toggleSelect(isOpen);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-token-select {
  height: 64px;
  background: #ffffff;
  margin: 0 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;

  &__image {
    background: @buttonBg;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
    width: 32px;
    height: 32px;
    border-radius: 100%;
    overflow: hidden;
    margin-right: 12px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  &__info {
    h5 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      width: 290px;
      margin: 0 0 1px 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @secondaryLabel;
      margin: 0;
      width: 290px;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 4px;
    right: 8px;
    top: 16px;
  }
}
</style>
