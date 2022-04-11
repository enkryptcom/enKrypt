<template>
  <div class="check-phrase">
    <p>Select word #{{ id }}</p>
    <div class="check-phrase__wrap">
      <PhraseCheckbox
        v-for="(phrase, index) in phrases"
        :key="index"
        :is-checked="false"
        :check="check"
        :title="phrase.title"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "CheckPhrase",
};
</script>

<script setup lang="ts">
import { PropType } from "vue";
import PhraseCheckbox from "@action/components/phrase-checkbox/index.vue";
import { RecoveryPhrase } from "@action/types/phrase";

defineProps({
  id: {
    type: Number,
    default: 0,
  },
  phrases: {
    type: Object as PropType<Array<RecoveryPhrase>>,
    default: () => ({}),
  },
  update: {
    type: Function,
    default: () => ({}),
  },
});

const check = (isChecked: boolean) => {
  console.log(isChecked);
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
