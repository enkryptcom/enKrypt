import router from '@action/router';
import { BaseFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/base-firo-wallet';
import { isFiroSecretsRequiredError } from '@/providers/bitcoin/libs/firo-wallet/errors';

const wallet = new BaseFiroWallet();

/**
 * Opens the password (lock) screen so the user can re-enter their password.
 * The background unlock handler re-derives and stores the Firo wallet secret,
 * restoring pubkeys/keys for all Firo/Spark operations.
 */
export const openUnlockScreenToRestoreKeys = (): void => {
  if (router.currentRoute.value.name !== 'lock-screen') {
    router.push({ name: 'lock-screen' });
  }
};

/**
 * Returns true when the Firo secret is available. Otherwise opens the
 * password screen so the user can restore it and returns false.
 */
export const ensureFiroSecrets = async (): Promise<boolean> => {
  if (await wallet.hasSecret()) return true;
  openUnlockScreenToRestoreKeys();
  return false;
};

/**
 * If the given error means the Firo secret/pubkeys are missing, opens the
 * password screen and returns true. Returns false for any other error.
 */
export const handleFiroSecretsError = (error: unknown): boolean => {
  if (isFiroSecretsRequiredError(error)) {
    openUnlockScreenToRestoreKeys();
    return true;
  }
  return false;
};
