import { EnkryptAccount, WalletType } from '@enkryptcom/types';


export const getSparkHistoryAccount = (
  accounts: EnkryptAccount[],
): EnkryptAccount | undefined => {
  const seedAccounts = accounts.filter(
    account =>
      !account.isHardware && account.walletType === WalletType.mnemonic,
  );
  if (!seedAccounts.length) return undefined;
  return seedAccounts.reduce((first, account) =>
    account.pathIndex < first.pathIndex ? account : first,
  );
};
