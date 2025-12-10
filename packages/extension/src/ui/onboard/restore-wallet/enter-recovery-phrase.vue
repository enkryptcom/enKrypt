<template>
  <div class="enter-recovery-phrase">
    <h3>Enter your<br />recovery phrase</h3>
    <p>
      You can use 12, 15, 18, 21 or 24 words phrase to restore your wallet. Just
      enter as many words as you have in your phrase.
    </p>
    <textarea
      v-model="mnemonic"
      autocomplete="off"
      class="enter-recovery-phrase__input"
    />
    <div class="enter-recovery-phrase__extra-word">
      <div class="enter-recovery-phrase__extra-word__switch">
        <p>Do you have extra word?</p>
        <p class="enter-recovery-phrase__extra-word__switch-label">
          {{ extraWordToggleString }}
        </p>
        <Switch
          :is-checked="hasExtraWord"
          @update:check="hasExtraWord = !hasExtraWord"
        />
      </div>
      <div v-if="hasExtraWord">
        <input
          v-model="extraWord"
          placeholder="Enter extra word"
          class="enter-recovery-phrase__extra-word__input"
          autocomplete="off"
        />
      </div>
    </div>

    <div class="enter-recovery-phrase__buttons">
      <base-button title="Next" :click="nextAction" :disabled="!validate" />
    </div>
  </div>
</template>
<script setup lang="ts">
import BaseButton from '@action/components/base-button/index.vue';
import Switch from '@action/components/switch/index.vue';
import { useRouter } from 'vue-router';
import { validateMnemonic } from 'bip39';
import { ref, computed } from 'vue';
import { routes } from './routes';
import { useRestoreStore } from './store';

const store = useRestoreStore();
const mnemonic = ref('');
const router = useRouter();

/** -------------------
 * Extra Word
 * ------------------- */
const extraWord = ref<string | undefined>('');
const hasExtraWord = ref(false);

const extraWordToggleString = computed(() =>
  hasExtraWord.value ? 'Yes' : 'No',
);

/** -------------------
 * Methods
 * ------------------- */
const nextAction = () => {
  store.setMnemonic(formattedMnemonic.value);
  if (hasExtraWord.value && extraWord.value && extraWord.value !== '') {
    store.setExtraWord(extraWord.value);
    extraWord.value = '';
  }
  mnemonic.value = '';
  router.push({
    name: routes.pickPassword.name,
  });
};

const formattedMnemonic = computed(() => {
  const words = mnemonic.value.match(/\b(\w+)\b/g);
  if (!words) return '';
  return words.join(' ');
});
const validate = computed(() => {
  return validateMnemonic(formattedMnemonic.value);
});
</script>

<style lang="less">
@import '@action/styles/theme.less';

.enter-recovery-phrase {
  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }

  &__input {
    width: 100%;
    height: 128px;
    background: rgba(95, 99, 104, 0.01);
    border: 1px solid rgba(95, 99, 104, 0.2);
    box-sizing: border-box;
    border-radius: 10px;
    margin-bottom: 16px;
    resize: none;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    text-align: center;
    color: @primaryLabel;
    outline: none !important;
    padding: 16px;
    font-family: 'Roboto', sans-serif;
    flex-direction: row;

    &:active,
    &:focus {
      border: 2px solid @primary;
    }
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
  }

  &__buttons {
    text-align: center;
    margin-bottom: 16px;
  }
  &__extra-word {
    margin-bottom: 28px;
    padding-top: 10px;
    &__switch {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    p {
      color: @black;
      margin-top: 0px;
      margin-bottom: 0px;
    }
    &__switch-label {
      margin-left: auto;
      margin-right: 8px;
    }
    &__input {
      width: 100%;
      height: 46px;
      background: rgba(95, 99, 104, 0.01);
      border: 1px solid rgba(95, 99, 104, 0.2);
      box-sizing: border-box;
      border-radius: 10px;
      margin-top: 18px;
      resize: none;
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      display: flex;
      align-items: center;
      color: @primaryLabel;
      outline: none !important;
      padding: 16px;
      font-family: 'Roboto', sans-serif;
      flex-direction: row;

      &:active,
      &:focus {
        border: 2px solid @primary;
      }
    }
  }
}
</style>
