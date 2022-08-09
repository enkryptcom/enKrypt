<template>
  <div class="container">
    <div class="add-custom-token">
      <div class="add-custom-token__header">
        <h3>Add a token</h3>
        <a class="add-custom-token__close" @click="close">
          <close-icon />
        </a>
      </div>
      <div class="add-custom-token__contract-input">
        <div class="add-custom-token__contract-input__address">
          <p>Contract address:</p>
          <input
            v-model="contractAddress"
            :class="{ invalid: !isValidAddress }"
            type="text"
            placeholder="0x... address"
          />
        </div>
      </div>

      <div v-if="isValidAddress && tokenInfo">
        <div class="add-custom-token__token-info">
          <div class="add-custom-token__token-info__image">
            <img :src="network.icon" alt="" />
          </div>
          <div class="add-custom-token__token-info__info">
            <h5>{{ tokenInfo.name }}</h5>
            <p>
              {{
                accountBalance
                  ? $filters.formatFloatingPointValue(accountBalance).value
                  : "~"
              }}
              <span>{{ tokenInfo.symbol }}</span>
            </p>
          </div>
        </div>
        <div class="add-custom-token__warning">
          <warn-icon />
          <p>
            Be sure to validate this is the ERC20 token you think it is! Anyone
            can create a token, even one pretending to be another popular token.
          </p>
        </div>
      </div>
      <div v-else-if="isValidAddress && notTokenAddress">
        <div class="add-custom-token__error">
          <alert-icon />
          <p>
            There is no ERC20 token deployed at this address. Make sure you have
            the right contract address and you are connected to the correct
            network.
          </p>
        </div>
      </div>

      <div class="add-custom-token__buttons">
        <div class="add-custom-token__buttons-cancel">
          <base-button title="Cancel" :click="close" :no-background="true" />
        </div>
        <div class="add-custom-token__buttons-send">
          <base-button
            title="Add Token"
            :disabled="!isValidAddress || !tokenInfo"
            :click="close"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import API from "@/providers/ethereum/libs/api";
import { ERC20TokenInfo } from "@/providers/ethereum/types";
import { BaseNetwork } from "@/types/base-network";
import { computed, ref, watch } from "vue";
import { isAddress, toBN } from "web3-utils";
import { Erc20Token } from "@/providers/ethereum/types/erc20-token";
import { fromBase } from "@/libs/utils/units";
import CloseIcon from "@/ui/action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import AlertIcon from "@action/icons/send/alert-icon.vue";
import WarnIcon from "@action/icons/send/warning-icon.vue";

interface IProps {
  network: BaseNetwork;
  address: string;
}

const emits = defineEmits<{ (e: "update:close"): void }>();

const props = defineProps<IProps>();

const contractAddress = ref<string>();

const tokenInfo = ref<ERC20TokenInfo>();
const accountBalance = ref<string>("");
const notTokenAddress = ref(false);

const isValidAddress = computed(() => {
  if (contractAddress.value) {
    return isAddress(contractAddress.value);
  }

  return false;
});

watch([contractAddress, props], async () => {
  notTokenAddress.value = false;
  tokenInfo.value = undefined;
  accountBalance.value = "";

  if (isValidAddress.value) {
    const api = (await props.network.api()) as API;

    const info = await api.getTokenInfo(contractAddress.value!);

    if (info.name !== "Unknown") {
      const erc20Token = new Erc20Token({
        name: info.name,
        symbol: info.symbol,
        decimals: info.decimals,
        icon: props.network.icon,
        contract: contractAddress.value!,
      });

      tokenInfo.value = info;

      if (props.address !== "") {
        const balance = await erc20Token.getLatestUserBalance(
          api,
          props.address
        );
        accountBalance.value = fromBase(
          toBN(balance).toString(),
          info.decimals
        );
      }
    } else {
      notTokenAddress.value = true;
    }
  }
});

const close = () => {
  emits("update:close");
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
  position: absolute;
  top: 0;
  z-index: 10;
}

.add-custom-token {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

    &.popup {
      padding: 24px 0 12px 0;
    }

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

    &:hover {
      background: @black007;
    }
  }

  &__contract-input {
    height: 64px;
    background: #ffffff;
    margin: 12px 32px 8px 32px;
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

    &__address {
      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: @secondaryLabel;
        margin: 0;
      }

      input {
        width: 290px;
        height: 24px;
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        border: 0 none;
        outline: none;
        padding: 0;
      }

      .invalid {
        color: @error;
      }
    }
  }

  &__token-info {
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
  }

  &__error {
    margin: 12px 32px 8px 32px;
    background: @error01;
    border-radius: 10px;
    padding: 12px 16px 12px 57px;
    position: relative;
    box-sizing: border-box;

    svg {
      position: absolute;
      left: 16px;
      top: 50%;
      margin-top: -12px;
    }
    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @error;
      margin: 0;
    }
  }

  &__warning {
    margin: 12px 32px 8px 32px;
    background: @orange01;
    border-radius: 10px;
    padding: 12px 16px 12px 57px;
    position: relative;
    box-sizing: border-box;

    svg {
      position: absolute;
      left: 16px;
      top: 50%;
      margin-top: -12px;
    }
    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @orange;
      margin: 0;
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
