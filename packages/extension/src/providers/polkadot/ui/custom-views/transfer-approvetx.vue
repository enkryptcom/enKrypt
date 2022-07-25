<template>
  <h3>Transfer</h3>
  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__info">
      <img :src="props.token.icon" />
      <div class="provider-verify-transaction__info-info">
        <h4>{{ props.token.symbol }}</h4>
        <p>
          {{ fromBase(props.amount, props.token.decimals || 0) }}
        </p>
      </div>
    </div>
  </div>
  <h3>To</h3>
  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__info">
      <img
        :src="
          network
            ? network?.identicon(props.to)
            : defaultNetwork.identicon(props.to)
        "
      />
      <div v-if="destName" class="provider-verify-transaction__account-info">
        <h3>{{ destName }}</h3>
        <p>
          {{
            `${props.to.slice(0, 5)}...${props.to.slice(props.to.length - 5)}`
          }}
        </p>
      </div>
      <div v-else class="provider-verify-transaction__account-info">
        <h4>
          {{
            `${props.to.slice(0, 5)}...${props.to.slice(props.to.length - 5)}`
          }}
        </h4>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PublicKeyRing from "@/libs/keyring/public-keyring";
import {
  DEFAULT_SUBSTRATE_NETWORK_NAME,
  getNetworkByName,
} from "@/libs/utils/networks";
import { BaseNetwork } from "@/types/base-network";
import { BaseToken } from "@/types/base-token";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { onBeforeMount, ref } from "vue";
import { fromBase } from "@/libs/utils/units";
// For some reason passing TransferProps as the type to defineProps throws an error
interface IProps {
  to: string;
  token: BaseToken;
  amount: string;
  network: BaseNetwork | undefined;
}
const props = defineProps<IProps>();
const destName = ref<string>();
const defaultNetwork = getNetworkByName(DEFAULT_SUBSTRATE_NETWORK_NAME)!;
onBeforeMount(async () => {
  const publicKeyring = new PublicKeyRing();
  const to = polkadotEncodeAddress(props.to);
  try {
    const foundAddress = await publicKeyring.getAccount(to);
    destName.value = foundAddress.name;
  } catch {
    // Just a pass so it's not empty as getAccount throws if there is no account
    null;
  }
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "../styles/verify-transaction.less";
</style>
