<template>
  <div class="double-check-phrase">
    <h3>Let's double check it</h3>

    <check-phrase
      v-for="(item, index) in phraseItems"
      :id="item.id"
      :key="index"
      :phrases="item.items"
      :valid-index="item.validIndex"
      @update:phrasevalidity="updateSelection(index, $event)"
    ></check-phrase>

    <base-button title="Next" :click="nextAction" :disabled="isDisabled" />
  </div>
</template>
<script setup lang="ts">
import BaseButton from "@action/components/base-button/index.vue";
import CheckPhrase from "@action/components/check-phrase/index.vue";
import { useRoute, useRouter } from "vue-router";
import { ref, computed } from "vue";
import { chunk, shuffle, sample } from "lodash";
const route = useRoute();
const router = useRouter();
const phrase = route.params.mnemonic as string;
let phraseArr: string[] = [];
if (!phrase) {
  router.back();
} else {
  phraseArr = phrase.split(" ");
}
const shuffledArr = shuffle(phraseArr);
const chunkedArr = chunk(shuffledArr, 3);
const phraseItems: { id: number; items: string[]; validIndex: number }[] = [];
const validSelection = ref<boolean[]>(chunkedArr.map(() => false));
const isDisabled = computed<boolean>(() => {
  return validSelection.value.includes(false);
});
chunkedArr.forEach((chunk) => {
  const randWord = sample(chunk) || "";
  phraseItems.push({
    id: phraseArr.findIndex((p) => p === randWord),
    items: chunk,
    validIndex: chunk.findIndex((p) => p === randWord),
  });
});
const updateSelection = (idx: number, val: boolean) => {
  console.log(idx, val, "isvalid selection");
  validSelection.value[idx] = val;
};

const nextAction = () => {
  router.push({ name: "create-wallet-wallet-ready", params: {} });
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.double-check-phrase {
  width: 100%;

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }
}
</style>
