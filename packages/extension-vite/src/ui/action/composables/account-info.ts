import MarketData from "@/libs/market-data";
import { BaseNetwork } from "@/types/base-network";
import { computed, ref, watch, onMounted, Ref } from "vue";
import { AccountsHeaderData } from "../types/account";
import { formatFloatingPointValue, formatFiatValue } from "../utils/filters";
const defaultFiatVal = "0.00";
export default (
  network: Ref<BaseNetwork>,
  accountInfo: Ref<AccountsHeaderData>
) => {
  const marketData = new MarketData();
  const fiatAmount = ref<string>(defaultFiatVal);

  const cryptoAmountRaw = computed(() => {
    const selectedAccountIdx = accountInfo.value.activeAccounts.findIndex(
      (acc) => acc.address === accountInfo.value.selectedAccount?.address
    );
    if (selectedAccountIdx > -1) {
      const balance = accountInfo.value.activeBalances[selectedAccountIdx];
      return balance;
    }
    return "0";
  });

  const cryptoAmount = computed(() => {
    return cryptoAmountRaw.value !== "~"
      ? formatFloatingPointValue(cryptoAmountRaw.value).value
      : cryptoAmountRaw.value;
  });

  const updateFiatValues = async () => {
    fiatAmount.value = defaultFiatVal;
    if (network.value.coingeckoID && cryptoAmountRaw.value != "~") {
      fiatAmount.value = `${
        formatFiatValue(
          await marketData.getTokenValue(
            cryptoAmountRaw.value,
            network.value.coingeckoID,
            "USD"
          )
        ).value
      } USD`;
    }
  };
  watch(cryptoAmount, updateFiatValues);
  onMounted(() => {
    updateFiatValues();
  });
  return {
    cryptoAmount,
    fiatAmount,
  };
};
