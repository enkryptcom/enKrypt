export const FIRO_SECRETS_REQUIRED = 'FIRO_SECRETS_REQUIRED';

/**
 * Thrown when an operation needs the Firo wallet secret (seed/pubkeys) but it
 * is not in storage (it is cleared on lock and on background restarts). The
 * UI reacts by opening the password screen; unlocking re-derives the secret.
 */
export class FiroSecretsRequiredError extends Error {
  constructor() {
    super(
      `${FIRO_SECRETS_REQUIRED}: Firo wallet keys are unavailable. Unlock Enkrypt with your password to restore them.`,
    );
    this.name = 'FiroSecretsRequiredError';
  }
}

/**
 * Detects the error above by message so it also works for errors that crossed
 * a worker boundary or were re-wrapped and lost their class.
 */
export const isFiroSecretsRequiredError = (error: unknown): boolean => {
  if (!error) return false;
  const message =
    typeof error === 'string'
      ? error
      : ((error as { message?: string }).message ?? '');
  return (
    message.includes(FIRO_SECRETS_REQUIRED) ||
    message.includes('FiroWallet not initialize')
  );
};
