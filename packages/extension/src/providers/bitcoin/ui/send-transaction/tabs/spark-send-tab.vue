<template>
  <div class="form__container">
    <send-spark-address-input
      ref="addressInputTo"
      class="no-margin"
      title="To address"
      :value="addressTo"
      :network="(network as BitcoinNetwork)"
      @update:input-address="inputAddressTo"
    />

    <send-token-select
      v-if="isSendToken"
      class="no-margin"
      :token="availableAsset"
    />
    <send-token-select
      v-if="isSendToken"
      class="no-margin"
      :token="unconfirmedAsset"
    />

    <send-input-amount
      v-if="isSendToken"
      class="no-margin"
      :amount="amount"
      :fiat-value="availableAsset.price"
      :has-enough-balance="!nativeBalanceAfterTransaction.isNeg()"
      @update:input-amount="inputAmount"
      @update:input-set-max="setMaxValue"
    />

    <send-alert
      v-show="nativeBalanceAfterTransaction.isNeg() || (Number(sendAmount) < (props.network as BitcoinNetwork).dust && Number(sendAmount)>0)"
      :native-symbol="network.name"
      :price="availableAsset.price || '0'"
      :native-value="
        fromBase(
          nativeBalanceAfterTransaction.abs().toString(),
          network.decimals
        )
      "
      :decimals="network.decimals"
      :below-dust="Number(sendAmount) < (props.network as BitcoinNetwork).dust"
      :dust="(props.network as BitcoinNetwork).dust.toString()"
      :not-enough="nativeBalanceAfterTransaction.isNeg()"
    />

    <div class="send-transaction__buttons">
      <div class="send-transaction__buttons-cancel">
        <base-button title="Cancel" :click="close" :no-background="true" />
      </div>
      <div class="send-transaction__buttons-send">
        <base-button
          title="Send"
          :click="sendAction"
          :disabled="!isInputsValid || nativeBalanceAfterTransaction.isNeg()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, PropType, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toBN } from "web3-utils";
import BigNumber from "bignumber.js";
import { trackSendEvents } from "@/libs/metrics";
import BaseButton from "@action/components/base-button/index.vue";
import SendSparkAddressInput from "../components/send-spark-address-input.vue";
import SendTokenSelect from "../components/send-token-select.vue";
import SendInputAmount from "@/providers/common/ui/send-transaction/send-input-amount.vue";
import SendAlert from "@/providers/bitcoin/ui/send-transaction/components/send-alert.vue";
import { BitcoinNetwork } from "@/providers/bitcoin/types/bitcoin-network";
import { BTCToken } from "@/providers/bitcoin/types/btc-token";
import { AccountsHeaderData, SparkAccount } from "@/ui/action/types/account";
import { SendEventType } from "@/libs/metrics/types";
import MarketData from "@/libs/market-data";
import { fromBase, isValidDecimals, toBase } from "@enkryptcom/utils";
import { isAddress, isSparkAddress } from "@/providers/bitcoin/libs/utils";
import { routes as RouterNames } from "@/ui/action/router";

const router = useRouter();
const route = useRoute();

const selected: string = route.params.id as string;

const props = defineProps({
  network: {
    type: Object as PropType<BitcoinNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
  sparkAccount: {
    type: Object as PropType<SparkAccount>,
    default: () => {
      return {};
    },
  },
  isSendToken: {
    type: Boolean,
    default: () => false,
  },
});

const loadingAvailableAsset = new BTCToken({
  icon: props.network.icon,
  symbol: "Firo",
  balance: "0",
  price: "0",
  name: "Firo",
  decimals: props.network.decimals,
  coingeckoID: "zcoin",
});

const loadingUnconfirmedAsset = new BTCToken({
  icon: props.network.icon,
  symbol: "Firo",
  balance: "0",
  price: "0",
  name: "Firo",
  decimals: props.network.decimals,
  coingeckoID: "zcoin",
});

const addressTo = ref<string>("");
const availableAsset = ref<BTCToken>(loadingAvailableAsset);
const unconfirmedAsset = ref<BTCToken>(loadingUnconfirmedAsset);
const amount = ref<string>("");
const isMaxSelected = ref<boolean>(false);

onMounted(async () => {
  trackSendEvents(SendEventType.SendOpen, { network: props.network.name });
  setAsset();
});

const isInputsValid = computed<boolean>(() => {
  if (
    !isSparkAddress(addressTo.value) &&
    !isAddress(addressTo.value, props.network.networkInfo)
  )
    return false;

  if (
    props.isSendToken &&
    !isValidDecimals(sendAmount.value, props.network.decimals!)
  ) {
    return false;
  }
  if (
    Number(sendAmount.value) < (props.network as BitcoinNetwork).dust &&
    props.isSendToken
  )
    return false;
  if (
    new BigNumber(sendAmount.value).gt(
      props.sparkAccount.sparkBalance.availableBalance
    )
  )
    return false;
  return true;
});

const sendAmount = computed(() => {
  if (amount.value && amount.value !== "") return amount.value;
  return "0";
});

const nativeBalanceAfterTransaction = computed(() => {
  if (availableAsset.value) {
    return toBN(String(props.sparkAccount.sparkBalance.availableBalance)).sub(
      toBN(toBase(sendAmount.value, props.network.decimals))
    );
  }
  return toBN(0);
});

const assetMaxValue = computed(() => {
  return fromBase(
    String(props.sparkAccount.sparkBalance.fullBalance),
    props.network.decimals
  );
});

const inputAmount = (inputAmount: string) => {
  if (inputAmount === "") {
    inputAmount = "0";
  }
  const inputAmountBn = new BigNumber(inputAmount);
  isMaxSelected.value = false;
  amount.value = inputAmountBn.lt(0) ? "0" : inputAmountBn.toString();
};

const sendAction = async () => {
  const fromAccountAddress = props.sparkAccount.allAddresses.at(-1)!;

  const toAmount = toBN(toBase(sendAmount.value, props.network.decimals));

  router.push({
    name: RouterNames.verifySendFromSpark.name,
    query: {
      id: selected,
      txData: Buffer.from(
        JSON.stringify({
          toToken: {
            amount: toAmount.toString(),
            decimals: availableAsset.value.decimals!,
            icon: availableAsset.value.icon as string,
            symbol: availableAsset.value.symbol,
            valueUSD: new BigNumber(availableAsset.value.price || "0")
              .times(sendAmount.value)
              .toString(),
            name: availableAsset.value.name,
            price: availableAsset.value.price || "0",
          },
          fromAddress: fromAccountAddress,
          fromAddressName: "Spark Account",
          toAddress: addressTo.value,
        }),
        "utf8"
      ).toString("base64"),
    },
  });
};

const setAsset = async () => {
  if (availableAsset.value.coingeckoID) {
    const market = new MarketData();
    const marketData = await market.getMarketData([
      availableAsset.value.coingeckoID,
    ]);

    availableAsset.value.price = (marketData[0]?.current_price ?? 0).toString();
  }

  availableAsset.value.balance = String(
    props.sparkAccount.sparkBalance.availableBalance
  );
  availableAsset.value.name = "Available Balance";
  unconfirmedAsset.value.balance = String(
    props.sparkAccount.sparkBalance.unconfirmedBalance
  );
  unconfirmedAsset.value.name = "Unconfirmed Balance";
};

const setMaxValue = () => {
  isMaxSelected.value = true;
  amount.value =
    parseFloat(assetMaxValue.value) < 0 ? "0" : assetMaxValue.value;
};

const inputAddressTo = (address: string) => {
  addressTo.value = address;
};

const close = () => {
  trackSendEvents(SendEventType.SendDecline, {
    network: props.network.name,
  });
  router.go(-1);
};
</script>

<style lang="less" scoped>
@import "@action/styles/theme.less";
@import "@action/styles/custom-scroll.less";

.form__container {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .no-margin {
    margin: 0 auto !important;
  }

  .send-transaction {
    &__buttons {
      padding: 0 32px 32px 32px;
      margin-top: 20px;
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
}
</style>
