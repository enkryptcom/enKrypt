<template>
  <div class="container">
    <div class="add-custom-token">
      <div class="add-custom-token__header">
        <h3>Add a token</h3>
        <a class="add-custom-token__close" @click="close">
          <close-icon />
        </a>
      </div>
      <div class="add-custom-token__contract-input" :class="{ focus: isFocus }">
        <div class="add-custom-token__contract-input__address">
          <p>Contract address:</p>
          <input
            v-model="contractAddress"
            :class="{ invalid: !isValidAddress }"
            type="text"
            placeholder="0x... address"
            @focus="changeFocus"
            @blur="changeFocus"
          />
        </div>
      </div>

      <div v-if="isValidAddress && tokenInfo">
        <div class="add-custom-token__token-info">
          <div class="add-custom-token__token-info__image">
            <img
              :src="tokenInfo.icon"
              alt=""
              @error="(e) => {
              (e.target as HTMLImageElement).src = props.network.icon
            }"
            />
          </div>
          <div class="add-custom-token__token-info__info">
            <h5 v-if="tokenInfo.name.length <= 16">{{ tokenInfo.name }}</h5>
            <tooltip v-else :text="tokenInfo.name"
              ><h5>{{ `${tokenInfo.name.slice(0, 12)}...` }}</h5></tooltip
            >
            <p>
              {{
                accountBalance
                  ? $filters.formatFloatingPointValue(
                      fromBase(accountBalance ?? "0", tokenInfo.decimals)
                    ).value
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
        <div class="add-custom-token__buttons-send">
          <base-button
            title="Add token"
            :disabled="!isValidAddress || !tokenInfo"
            :click="addToken"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import API from "@/providers/ethereum/libs/api";
import { computed, ref, toRaw, watch } from "vue";
import { Erc20Token } from "@/providers/ethereum/types/erc20-token";
import { fromBase } from "@enkryptcom/utils";
import CloseIcon from "@/ui/action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import AlertIcon from "@action/icons/send/alert-icon.vue";
import WarnIcon from "@action/icons/send/warning-icon.vue";
import { TokensState } from "@/libs/tokens-state";
import { CustomErc20Token, TokenType } from "@/libs/tokens-state/types";
import { AssetsType } from "@/types/provider";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import MarketData from "@/libs/market-data";
import Tooltip from "@/ui/action/components/tooltip/index.vue";
import { CoinGeckoTokenMarket } from "@/libs/market-data/types";
import BigNumber from "bignumber.js";
import Sparkline from "@/libs/sparkline";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";

interface IProps {
  network: EvmNetwork;
  address: string;
}

const emits = defineEmits<{
  (e: "update:close"): void;
  (e: "update:token-added", asset: AssetsType): void;
}>();

const props = defineProps<IProps>();

const tokensState = new TokensState();

const contractAddress = ref<string>();
const tokenInfo = ref<CustomErc20Token>();
const accountBalance = ref<string>();
const notTokenAddress = ref(false);
const isFocus = ref(false);
const market = ref<CoinGeckoTokenMarket>();

const isValidAddress = computed(() => {
  if (contractAddress.value) {
    return props.network.isAddress(contractAddress.value);
  }

  return false;
});

watch([contractAddress, props], async () => {
  notTokenAddress.value = false;
  tokenInfo.value = undefined;
  accountBalance.value = undefined;

  if (!props.network.customTokens) {
    close();
  }

  if (isValidAddress.value) {
    const api = (await props.network.api()) as API;

    const info = await api.getTokenInfo(contractAddress.value!);

    if (info.name !== "Unknown") {
      let icon = props.network.icon;
      let coingeckoID: string | undefined;

      const marketData = new MarketData();

      const coingeckoInfo = await marketData.getMarketInfoByContracts(
        [contractAddress.value!.toLowerCase()],
        props.network.coingeckoPlatform!
      );

      const contractInfo = coingeckoInfo[contractAddress.value!.toLowerCase()];

      if (contractInfo) {
        market.value = contractInfo;
        icon = contractInfo.image;
        coingeckoID = contractInfo.id;
      }

      if (props.address !== "") {
        const erc20Token = new Erc20Token({
          name: info.name,
          symbol: info.symbol,
          decimals: info.decimals,
          icon,
          contract: contractAddress.value!,
          coingeckoID,
        });

        try {
          const balance = await erc20Token.getLatestUserBalance(
            api,
            props.address
          );
          accountBalance.value = balance;
        } catch {
          // Don't set balance
        }
      }

      tokenInfo.value = {
        address: contractAddress.value as `0x${string}`,
        icon,
        type: TokenType.ERC20,
        coingeckoID,
        ...info,
      };
    } else {
      notTokenAddress.value = true;
    }
  }
});

const changeFocus = (val: FocusEvent) => {
  isFocus.value = val.type === "focus";
};

const close = () => {
  emits("update:close");
};

const addToken = async () => {
  if (isValidAddress.value && tokenInfo.value) {
    const inserted = await tokensState.addErc20Token(
      props.network.name,
      toRaw(tokenInfo.value)
    );

    if (inserted) {
      const balance = fromBase(
        accountBalance.value ?? "0",
        tokenInfo.value.decimals
      );
      const balancef = formatFloatingPointValue(
        fromBase(accountBalance.value ?? "0", tokenInfo.value.decimals)
      ).value;
      const balanceUSD = market.value
        ? new BigNumber(balancef).times(market.value.current_price).toNumber()
        : 0;
      const balanceUSDf = market.value
        ? new BigNumber(balancef).times(market.value.current_price).toString()
        : "0";
      const value = market.value?.current_price.toString() ?? "0";
      const sparkline = market.value
        ? new Sparkline(market.value?.sparkline_in_7d.price, 25).dataValues
        : "";
      const priceChangePercentage =
        market.value?.price_change_percentage_24h ?? 0;
      const icon = tokenInfo.value.icon;

      const newAsset: AssetsType = {
        name: tokenInfo.value.name,
        symbol: tokenInfo.value.symbol,
        balance,
        balancef,
        contract: tokenInfo.value.address,
        balanceUSD,
        balanceUSDf,
        value,
        valuef: formatFloatingPointValue(value).value,
        decimals: tokenInfo.value.decimals,
        sparkline,
        priceChangePercentage,
        icon,
      };

      emits("update:token-added", newAsset);
    }

    emits("update:close");
  }
};
</script>
<style lang="less" scoped>
@import "~@action/styles/theme.less";

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 600px;
  background-color: @overlayBg !important;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}

.add-custom-token {
  width: 460px;
  height: 568px;
  box-sizing: border-box;
  position: relative;
  border-radius: 12px;
  background-color: white;

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

    &.focus {
      border: 2px solid @primary;
      width: calc(~"100% - 62px");
      margin: 12px 31px 8px 31px;
    }

    &__address {
      width: 100%;

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
        width: 100%;
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
        width: 128px;
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
        width: 128px;

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
    padding: 0 32px 16px 32px;
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
      width: 100%;
    }
  }
}
</style>
