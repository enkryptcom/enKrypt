<template>
  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__amount">
      <img :src="props.token.icon" />

      <div class="provider-verify-transaction__amount-info">
        <h4>
          {{ fromBase(props.amount, props.token.decimals || 0) }}
          <span>{{ props.token.symbol }}</span>
        </h4>
      </div>
    </div>
  </div>

  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__account">
      <img
        :src="
          network
            ? network?.identicon(props.to)
            : defaultNetwork.identicon(props.to)
        "
      />
      <div class="provider-verify-transaction__account-info">
        <h6>To</h6>
        <h4>{{ destName }}</h4>

        <div
          v-if="destName"
          class="provider-verify-transaction__account-info-to"
        >
          {{ $filters.replaceWithEllipsis(props.to, 4, 4) }}
        </div>
        <div v-else class="provider-verify-transaction__account-info-to">
          {{ $filters.replaceWithEllipsis(props.to, 5, 5) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { BaseNetwork } from "@/types/base-network";
import { BaseToken } from "@/types/base-token";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { onBeforeMount, ref } from "vue";
import { fromBase } from "@enkryptcom/utils";
import Polkadot from "@/providers/polkadot/networks/polkadot";

// For some reason passing TransferProps as the type to defineProps throws an error
interface IProps {
  to: string;
  token: BaseToken;
  amount: string;
  network: BaseNetwork | undefined;
}
const props = defineProps<IProps>();
const destName = ref<string>();
const defaultNetwork = Polkadot;
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
