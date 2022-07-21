<template>
  <div class="settings__recovery-phrase">
    <settings-inner-header
      :back="back"
      :close="close"
      :is-phrase="true"
    ></settings-inner-header>

    <div class="settings__recovery-phrase-wrap">
      <p>
        Please keep your recovery phrase safe. If you give it to somebody, they
        will have full control of your funds.
      </p>

      <div class="recovery-phrase__wrap">
        <div class="recovery-phrase__block">
          <div class="recovery-phrase__item"><span>1</span> witch</div>
          <div class="recovery-phrase__item"><span>2</span> collapse</div>
          <div class="recovery-phrase__item"><span>3</span> practice</div>
          <div class="recovery-phrase__item"><span>4</span> feed</div>
          <div class="recovery-phrase__item"><span>5</span> shame</div>
          <div class="recovery-phrase__item"><span>6</span> open</div>
        </div>

        <div class="recovery-phrase__block">
          <div class="recovery-phrase__item"><span>7</span> despair</div>
          <div class="recovery-phrase__item"><span>8</span> creek</div>
          <div class="recovery-phrase__item"><span>9</span> road</div>
          <div class="recovery-phrase__item"><span>10</span> again</div>
          <div class="recovery-phrase__item"><span>11</span> ice</div>
          <div class="recovery-phrase__item"><span>12</span> least</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import SettingsInnerHeader from "@action/views/settings/components/settings-inner-header.vue";

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  back: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
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
