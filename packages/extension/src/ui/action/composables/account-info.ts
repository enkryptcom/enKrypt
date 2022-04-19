import MarketData from "@/libs/market-data";
import { NodeType } from "@/types/provider";
import { computed, ref, watch, onMounted, Ref } from "vue";
import { AccountsHeaderData } from "../types/account";
const defaultFiatVal = "~";
export default (
  network: Ref<NodeType>,
  accountInfo: Ref<AccountsHeaderData>
) => {
  const marketData = new MarketData();
  const fiatAmount = ref<string>(defaultFiatVal);
  const cryptoAmount = computed(() => {
    const selectedAccountIdx = accountInfo.value.activeAccounts.findIndex(
      (acc) => acc.address === accountInfo.value.selectedAccount?.address
    );
    let balance = "0";
    if (selectedAccountIdx > -1) {
      balance = accountInfo.value.activeBalances[selectedAccountIdx];
    }
    return balance;
  });

  const updateFiatValues = async () => {
    fiatAmount.value = defaultFiatVal;
    if (network.value.coingeckoID && cryptoAmount.value != "~") {
      fiatAmount.value = `${await marketData.getTokenValue(
        cryptoAmount.value,
        network.value.coingeckoID,
        "USD"
      )} USD`;
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
