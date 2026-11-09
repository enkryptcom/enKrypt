import { ref, computed } from 'vue';
import zxcvbn from 'zxcvbn';
import type { InputFeedback } from '@common/components/input/types';

enum PasswordStrength {
  veryWeak,
  weak,
  medium,
  strong,
  veryStrong,
}
const STRENGTH_FEEDBACK: Record<PasswordStrength, InputFeedback> = {
  [PasswordStrength.veryWeak]: { type: 'error', message: 'Very weak password' },
  [PasswordStrength.weak]: { type: 'error', message: 'Weak password' },
  [PasswordStrength.medium]: { type: 'warning', message: 'Medium password' },
  [PasswordStrength.strong]: { type: 'success', message: 'Strong password' },
  [PasswordStrength.veryStrong]: {
    type: 'success',
    message: 'Very strong password',
  },
};

/**
 * Password field state with zxcvbn strength scoring.
 *
 * @param minStrength - Lowest strength that counts as valid (default: medium).
 *
 * @example
 * const { password, isValid, strengthFeedback } = usePassword();
 * <app-input v-model="password" type="password" :feedback="strengthFeedback" />
 */
export const usePassword = (
  minStrength: PasswordStrength = PasswordStrength.medium,
) => {
  const password = ref('');

  /** Password with surrounding whitespace removed — what gets stored. */
  const trimmedPassword = computed(() => password.value.trim());

  // zxcvbn score 0–4 maps 1:1 onto PasswordStrength (veryWeak … veryStrong)
  const strength = computed<PasswordStrength>(
    () => zxcvbn(trimmedPassword.value).score,
  );

  const isValid = computed(() => strength.value >= minStrength);

  /** AppInput `feedback` row; hidden until the user types. */
  const strengthFeedback = computed(() =>
    password.value ? STRENGTH_FEEDBACK[strength.value] : undefined,
  );

  return {
    password,
    trimmedPassword,
    strength,
    isValid,
    strengthFeedback,
  };
};
