<template>
  <h3>Transfer</h3>
  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__info">
      <img :src="props.token.icon" />
      <div class="provider-verify-transaction__info-info">
        <h4>{{ props.token.symbol }}</h4>
        <p>
          {{ props.amount }}
        </p>
      </div>
    </div>
  </div>
  <h3>To</h3>
  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__info">
      <img :src="createIcon(props.to)" />
      <div v-if="destName" class="provider-verify-transaction__info-info">
        <h3>{{ destName }}</h3>
        <p>
          {{
            `${props.to.slice(0, 5)}...${props.to.slice(props.to.length - 5)}`
          }}
        </p>
      </div>
      <div v-else class="provider-verify-transaction__info-info">
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
@import "~@action/styles/provider-verify-transaction.less";
</style>
