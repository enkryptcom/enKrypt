<template>
  <div class="recovery-phrase">
    <h3>Secret recovery phrase</h3>
    <p>
      Write it down on paper. Resist temptation to email it to yourself or
      screenshot it.
    </p>
    <p>
      Please keep your recovery phrase safe. If you give it to somebody, they
      will have full control of your funds.
    </p>

    <div class="recovery-phrase__wrap">
      <div class="recovery-phrase__block">
        <div
          v-for="(phrase, index) in firstSet"
          :key="index"
          class="recovery-phrase__item"
        >
          <span>{{ index + 1 }}</span> {{ phrase }}
        </div>
      </div>

      <div class="recovery-phrase__block">
        <div
          v-for="(phrase, index) in secondSet"
          :key="index"
          class="recovery-phrase__item"
        >
          <span>{{ index + 7 }}</span> {{ phrase }}
        </div>
      </div>
    </div>
    <base-button title="Next" :click="nextAction" />
  </div>
</template>
<script setup lang="ts">
import BaseButton from "@action/components/base-button/index.vue";
import { useRouter, useRoute } from "vue-router";
import { onMounted, computed, ref } from "vue";
import { generateMnemonic } from "bip39";
import { routes } from "./routes";

const router = useRouter();
const route = useRoute();
const password = route.params.password;
const mnemonic = ref("");

const nextAction = () => {
  router.push({
    name: routes.checkPhrase.name,
    params: { mnemonic: mnemonic.value, password },
  });
};

onMounted(() => {
  createMnemonic();
  console.log(password);
  checkForPassword();
});

const checkForPassword = () => {
  if (!password) {
    router.push({ name: "create-wallet-pick-password", params: {} });
  }
};

const createMnemonic = () => {
  mnemonic.value = generateMnemonic(128);
  console.log(mnemonic.value);
};

const firstSet = computed(() => {
  let copy = mnemonic.value.split(" ");
  return copy.splice(0, 6);
});
const secondSet = computed(() => {
  let copy = mnemonic.value.split(" ");
  return copy.splice(6);
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.recovery-phrase {
  width: 100%;

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @orange;
    margin: 0 0 16px 0;
  }

  &__wrap {
    background: @lightBg;
    border: 1px solid rgba(95, 99, 104, 0.1);
    box-sizing: border-box;
    border-radius: 10px;
    padding: 8px 16px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-around;
  }

  &__block {
    width: 50%;
  }

  &__item {
    padding: 2px 0 2px 32px;
    position: relative;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 28px;
    letter-spacing: 0.15px;
    color: @primaryLabel;

    span {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @secondaryLabel;
      position: absolute;
      left: 0;
      top: 11px;
    }
  }
}
</style>
