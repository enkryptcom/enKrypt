<template>
  <div class="double-check-phrase">
    <h3>Let’s double check it</h3>

    <check-phrase
      v-for="(item, index) in phrases"
      :key="index"
      :id="item.id"
      :phrases="item.items"
    ></check-phrase>
    
    <base-button title="Next" :click="nextAction" />
  </div>
</template>
<script setup lang="ts">
import BaseButton from "@action/components/base-button/index.vue";
import CheckPhrase from "@action/components/check-phrase/index.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const phrases = [
  {
    id: 3,
    items: [
      {
        id: 1,
        title: "monk",
        isTrue: false,
      },
      {
        id: 2,
        title: "witch",
        isTrue: false,
      },
      {
        id: 3,
        title: "practice",
        isTrue: true,
      },
    ],
  },
  {
    id: 8,
    items: [
      {
        id: 1,
        title: "paper",
        isTrue: false,
      },
      {
        id: 2,
        title: "shame",
        isTrue: false,
      },
      {
        id: 3,
        title: "opera",
        isTrue: true,
      },
    ],
  },
  {
    id: 12,
    items: [
      {
        id: 1,
        title: "least",
        isTrue: false,
      },
      {
        id: 2,
        title: "witch",
        isTrue: false,
      },
      {
        id: 3,
        title: "paper",
        isTrue: true,
      },
    ],
  },
];

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
