<template>
  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__amount">
      <img :src="props.token.icon" />

      <div class="provider-verify-transaction__amount-info">
        <h4>
          {{ props.amount }} <span>{{ props.token.symbol }}</span>
        </h4>
        <!-- <p>$4520.54</p> -->
      </div>
    </div>
  </div>

  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__account">
      <img :src="createIcon(props.to)" />
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
import { BaseToken } from "@/types/base-token";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { onBeforeMount, ref } from "vue";
import createIcon from "../../libs/blockies";
// import { TransferProps } from "./types"

// For some reason passing TransferProps as the type to defineProps throws an error
interface IProps {
  to: string;
  token: BaseToken;
  amount: string;
}

const props = defineProps<IProps>();

const destName = ref<string>();

onBeforeMount(async () => {
  const publicKeyring = new PublicKeyRing();
  const to = polkadotEncodeAddress(props.to, 42);

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
