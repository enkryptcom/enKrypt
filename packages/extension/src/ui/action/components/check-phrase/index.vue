<template>
  <div class="check-phrase">
    <p>Select word #{{ id + 1 }}</p>
    <div class="check-phrase__wrap">
      <PhraseCheckbox
        v-for="(phrase, index) in phrases"
        :key="index"
        :title="phrase"
        :is-checked="isChecked[index]"
        @update:checked="onChecked(index, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import PhraseCheckbox from "@action/components/phrase-checkbox/index.vue";
import { ref } from "vue";

const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
  phrases: {
    type: Object as PropType<string[]>,
    default: () => ({}),
  },
  validIndex: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits<{
  (e: "update:phrasevalidity", checked: boolean): void;
}>();
const isChecked = ref<boolean[]>(props.phrases.map(() => false));
const onChecked = (key: number, val: boolean) => {
  isChecked.value = props.phrases.map(() => false);
  isChecked.value[key] = val;
  if (key === props.validIndex && val) emit("update:phrasevalidity", true);
  else emit("update:phrasevalidity", false);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.check-phrase {
  width: 100%;
  margin-bottom: 16px;

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
    margin: 0 0 8px 0;
  }

  &__wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
  }
}
</style>
