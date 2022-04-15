<template>
  <div class="double-check-phrase">
    <h3>Let’s double check it</h3>

    <check-phrase
      v-for="(item, index) in phrases"
      :id="item.id"
      :key="index"
      :phrases="item.items"
    ></check-phrase>

    <base-button title="Next" :click="nextAction" />
  </div>
</template>
<script setup lang="ts">
import BaseButton from "@action/components/base-button/index.vue";
import CheckPhrase from "@action/components/check-phrase/index.vue";
import { useRoute, useRouter } from "vue-router";
import { random, chunk, flattenDeep } from "lodash";
import { ref, onMounted } from "@vue/runtime-core";

const route = useRoute();
const router = useRouter();

// const phrases = ref([]);

// const phrasesList = route.params.mnemonic;
// const checkFirst = random(1, 4);
// const checkSecond = random(5, 8);
// const checkThird = random(9, 12);
// const first = phrasesList[checkFirst - 1];
// const second = phrasesList[checkSecond - 1];
// const third = phrasesList[checkThird - 1];

// const setUpPhrases = (phrases) => {
//   const removeAnswers = [first, second, third];
//   const choices = phrases.filter((word) => {
//     return !removeAnswers.includes(word);
//   });
//   while (choices.length !== 6) {
//     choices.splice(Math.floor(Math.random() * choices.length), 1);
//   }
//   const split = chunk(choices, 2);

//   for (let i = 0; i < split.length; i++) {
//     const randomIndex = random(0, 2);
//     let set = split[i];
//     const correctPhrase = removeAnswers[i];
//     set.splice(randomIndex, 0, correctPhrase);
//   }

//   const formattChoices = flattenDeep(split);
//   let newArr = [];
//   for (let i = 0; i < formattChoices.length; i++) {
//     const choice = formattChoices[i];
//     newArr.push({
//       id: i + 1,
//       title: choice,
//       isTrue: removeAnswers.includes(choice),
//     });
//   }

//   return chunk(newArr, 3);
// };

// const generateCheckList = () => {
//   let list = [];
//   const checkNums = [checkFirst, checkSecond, checkThird];
//   const choices = setUpPhrases(phrasesList);

//   for (let i = 0; i < choices.length; i++) {
//     const set = choices[i];
//     let obj = {
//       id: checkNums[i],
//       items: set,
//     };
//     list.push(obj);
//   }

//   phrases.value = [...list];
//   return list;
// };

// onMounted(() => {
//   generateCheckList();
// });

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
