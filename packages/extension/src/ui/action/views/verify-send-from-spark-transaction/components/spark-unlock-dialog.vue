<template>
  <div class="spark-unlock-dialog">
    <div class="spark-unlock-dialog__wrap">
      <h4>Enter your password</h4>
      <p class="spark-unlock-dialog__text">
        Enkrypt needs your password again to finish this private transaction.
        Nothing you have done here is lost.
      </p>
      <lock-screen-password-input
        :is-error="isError"
        :value="password"
        @update:value="passwordChanged"
        @keyup.enter="unlockAction"
      />
      <div class="spark-unlock-dialog__buttons">
        <base-button
          title="Cancel"
          :click="() => emit('cancel')"
          :gray="true"
          :disabled="isUnlocking"
        />
        <base-button
          title="Unlock"
          :click="unlockAction"
          :disabled="isDisabled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { sendToBackgroundFromAction } from '@/libs/messenger/extension';
import { InternalMethods } from '@/types/messenger';
import BaseButton from '@action/components/base-button/index.vue';
import LockScreenPasswordInput from '@action/views/lock-screen/components/lock-screen-password-input.vue';

/**
 * Asks for the password in place, without leaving the page, so a Spark spend
 * that took a long time to build is not thrown away. Unlocking in the
 * background restores the Firo wallet secret (see InternalMethods.unlock).
 */
const emit = defineEmits<{
  (e: 'unlocked'): void;
  (e: 'cancel'): void;
}>();

const password = ref('');
const isError = ref(false);
const isUnlocking = ref(false);
const isDisabled = computed(
  () => password.value.length < 5 || isUnlocking.value,
);

const passwordChanged = (text: string) => {
  password.value = text;
  isError.value = false;
};

const unlockAction = async () => {
  if (isDisabled.value) return;
  isUnlocking.value = true;
  const unlockStatus = await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.unlock,
      params: [password.value.trim(), true],
    }),
  });
  isUnlocking.value = false;
  if (unlockStatus.error) {
    isError.value = true;
    return;
  }
  password.value = '';
  emit('unlocked');
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.spark-unlock-dialog {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.32);

  &__wrap {
    width: 100%;
    max-width: 360px;
    padding: 24px;
    box-sizing: border-box;
    background: @white;
    border-radius: 12px;
    box-shadow:
      0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);

    h4 {
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      color: @primaryLabel;
      margin: 0 0 8px 0;
    }
  }

  &__text {
    font-size: 14px;
    line-height: 20px;
    color: @secondaryLabel;
    margin: 0 0 16px 0;
  }

  &__buttons {
    display: flex;
    gap: 12px;

    & > * {
      flex: 1;
    }
  }
}
</style>
