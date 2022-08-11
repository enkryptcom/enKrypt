<template>
  <div class="settings__recovery-phrase">
    <settings-inner-header v-bind="$attrs" :is-phrase="true" />

    <div class="settings__recovery-phrase-wrap">
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
            <span>{{ index + firstSet.length + 1 }}</span> {{ phrase }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SettingsInnerHeader from "@action/views/settings/components/settings-inner-header.vue";
import { computed } from "vue";

const props = defineProps({
  mnemonic: {
    type: String,
    default: "",
  },
});

const firstSet = computed(() => {
  const copy = props.mnemonic.split(" ");
  return copy.splice(0, copy.length / 2);
});
const secondSet = computed(() => {
  const copy = props.mnemonic.split(" ");
  return copy.splice(copy.length / 2);
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.settings {
  &__recovery-phrase {
    &-wrap {
      padding: 0 32px;
      p {
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        color: @error;
        margin: 0 0 12px 0;
      }
    }

    .recovery-phrase {
      width: 100%;

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
        -webkit-touch-callout: text;
        -webkit-user-select: text;
        -khtml-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;

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
  }
}
</style>
