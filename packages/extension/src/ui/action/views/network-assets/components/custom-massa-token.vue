<template>
  <div class="container">
    <div class="add-custom-token">
      <div class="add-custom-token__header">
        <h3>Add a token</h3>
        <a class="add-custom-token__close" @click="close">
          <close-icon />
        </a>
      </div>
      <div class="add-custom-token__content">
        <div
          class="add-custom-token__contract-input"
          :class="{ focus: isFocus }"
        >
          <div class="add-custom-token__contract-input__address">
            <p>Contract address:</p>
            <input
              v-model="contractAddress"
              :class="{ invalid: !isValidAddress }"
              type="text"
              placeholder="Enter Massa contract address"
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
                @error="
                  e => {
                    (e.target as HTMLImageElement).src = props.network.icon;
                  }
                "
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
                        fromBase(accountBalance ?? '0', tokenInfo.decimals),
                      ).value
                    : '~'
                }}
                <span v-if="tokenInfo.symbol.length <= 16">{{
                  tokenInfo.symbol
                }}</span>
                <tooltip v-else :text="tokenInfo.symbol"
                  ><span>{{
                    `${tokenInfo.symbol.slice(0, 12)}...`
                  }}</span></tooltip
                >
              </p>
            </div>
          </div>
          <div class="add-custom-token__warning">
            <warn-icon />
            <p>
              Be sure to validate this is the Massa token you think it is!
              Anyone can create a token, even one pretending to be another
              popular token.
            </p>
          </div>
        </div>
        <div v-else-if="isValidAddress && notTokenAddress">
          <div class="add-custom-token__error">
            <alert-icon />
            <p>
              There is no Massa token deployed at this address. Make sure you
              have the right contract address and you are connected to the
              correct network.
            </p>
          </div>
        </div>
      </div>

      <div class="add-custom-token__buttons">
        <div class="add-custom-token__buttons-send">
          <button
            class="add-token-btn"
            :disabled="!isValidAddress || !tokenInfo"
            @click="addToken"
          >
            Add token
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue';
import { fromBase } from '@enkryptcom/utils';
import CloseIcon from '@/ui/action/icons/common/close-icon.vue';
import AlertIcon from '@action/icons/send/alert-icon.vue';
import WarnIcon from '@action/icons/send/warning-icon.vue';
import { TokensState } from '@/libs/tokens-state';
import { CustomMassaToken, TokenType } from '@/libs/tokens-state/types';
import { AssetsType } from '@/types/provider';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';
import Tooltip from '@/ui/action/components/tooltip/index.vue';
import BigNumber from 'bignumber.js';
import { BaseNetwork } from '@/types/base-network';
import { Address, MRC20 } from '@massalabs/massa-web3';
import MassaAPI from '../../../../../providers/massa/libs/api';

interface IProps {
  network: BaseNetwork;
  address: string;
}

const emits = defineEmits<{
  (e: 'update:close'): void;
  (e: 'update:token-added', asset: AssetsType): void;
}>();

const props = defineProps<IProps>();

const tokensState = new TokensState();

const contractAddress = ref<string>('');
const tokenInfo = ref<CustomMassaToken>();
const accountBalance = ref<string>();
const notTokenAddress = ref(false);
const isFocus = ref(false);

const isValidAddress = computed(() => {
  if (contractAddress.value) {
    try {
      Address.fromString(contractAddress.value);
      return true;
    } catch (error) {
      return false;
    }
  }
  return false;
});

const close = () => {
  emits('update:close');
};

const changeFocus = (val: FocusEvent) => {
  isFocus.value = val.type === 'focus';
};

const fetchTokenInfo = async () => {
  if (!isValidAddress.value) {
    tokenInfo.value = undefined;
    accountBalance.value = undefined;
    notTokenAddress.value = false;
    return;
  }

  try {
    const api = (await props.network.api()) as MassaAPI;
    const mrc20 = new MRC20(api.provider, contractAddress.value);

    // Fetch token information
    const name = await mrc20.name();
    const symbol = await mrc20.symbol();
    const decimals = await mrc20.decimals();

    const tokenInfos: CustomMassaToken = {
      type: TokenType.ERC20,
      name,
      symbol,
      decimals,
      icon: props.network.icon,
      address: contractAddress.value as `AS${string}`,
    };

    tokenInfo.value = tokenInfos;

    // Get token balance
    try {
      const balance = await api.getBalanceMRC20(
        props.address,
        contractAddress.value,
      );
      accountBalance.value = balance;
    } catch (balanceError) {
      accountBalance.value = '0';
    }

    notTokenAddress.value = false;
  } catch (error) {
    console.error('Error fetching token info:', error);
    tokenInfo.value = undefined;
    accountBalance.value = undefined;
    notTokenAddress.value = true;
  }
};

const addToken = async () => {
  if (!tokenInfo.value) return;

  try {
    // Add token to state
    await tokensState.addMassaToken(props.network.name, toRaw(tokenInfo.value));

    // Create asset for UI
    const balanceFormatted = fromBase(
      accountBalance.value ?? '0',
      tokenInfo.value.decimals,
    );
    const balanceDisplayFormatted =
      formatFloatingPointValue(balanceFormatted).value;

    // For Massa tokens, we'll use default values since market data is not available
    const price = '0';
    const priceChangePercentage = 0;
    const sparklineData = '';

    const balanceUSD = new BigNumber(balanceDisplayFormatted)
      .times(price)
      .toNumber();
    const balanceUSDf = new BigNumber(balanceDisplayFormatted)
      .times(price)
      .toString();
    const priceFormatted = formatFloatingPointValue(price).value;

    const asset: AssetsType = {
      name: tokenInfo.value.name,
      symbol: tokenInfo.value.symbol,
      icon: tokenInfo.value.icon,
      balance: balanceFormatted,
      balancef: balanceDisplayFormatted,
      balanceUSD,
      balanceUSDf,
      value: price,
      valuef: priceFormatted,
      decimals: tokenInfo.value.decimals,
      sparkline: sparklineData,
      priceChangePercentage,
      contract: contractAddress.value,
    };

    emits('update:token-added', asset);
    close();
  } catch (error) {
    console.error('Error adding token:', error);
  }
};

watch(contractAddress, () => {
  fetchTokenInfo();
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.add-custom-token {
  background: @white;
  border-radius: 12px;
  width: 380px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 0 20px;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: @primaryLabel;
    }

    &__close {
      cursor: pointer;
      padding: 4px;
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    padding-top: 20px;
    padding-bottom: 10px;
    min-height: 0;
  }

  &__contract-input {
    margin-bottom: 16px;

    &.focus {
      border-color: @primary;
    }

    &__address {
      p {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: @secondaryLabel;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
        border: 1px solid @gray02;
        border-radius: 8px;
        font-size: 14px;
        outline: none;

        &.invalid {
          border-color: @error;
        }

        &:focus {
          border-color: @primary;
        }
      }
    }
  }

  &__token-info {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding: 12px;
    background: @gray01;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;

    &__image {
      width: 36px;
      height: 36px;
      margin-right: 10px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    &__info {
      flex: 1;
      min-width: 0;

      h5 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: @primaryLabel;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: @secondaryLabel;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  &__warning {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    padding: 10px;
    background: @orange01;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;

    svg {
      margin-right: 8px;
      margin-top: 2px;
      flex-shrink: 0;
    }

    p {
      margin: 0;
      font-size: 11px;
      color: @orange;
      line-height: 1.4;
      flex: 1;
      min-width: 0;
    }
  }

  &__error {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    padding: 10px;
    background: @error01;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;

    svg {
      margin-right: 8px;
      margin-top: 2px;
      flex-shrink: 0;
    }

    p {
      margin: 0;
      font-size: 11px;
      color: @error;
      line-height: 1.4;
      flex: 1;
      min-width: 0;
    }
  }

  &__buttons {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px 20px 20px;
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
    background: @white;
    border-top: 1px solid @gray02;
    min-height: 70px;

    &-send {
      display: flex;
      align-items: center;

      .add-token-btn,
      button {
        min-width: 120px;
        height: 40px;
        background: @primary;
        color: @white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover:not(:disabled) {
          background: darken(@primary, 10%);
        }

        &:disabled {
          background: @gray02;
          color: @secondaryLabel;
          cursor: not-allowed;
          opacity: 0.6;
        }
      }
    }
  }
}
</style>
