import { EnkryptAccount, NetworkNames, SignerType } from "@enkryptcom/types";
import PublicKeyRing from "../keyring/public-keyring";
import { getNetworkByName } from "./networks";

const getOtherSigners = (signers: SignerType[]): SignerType[] => {
  const otherSigners: SignerType[] = [];
  Object.values(SignerType).forEach((_signer) => {
    if (!signers.includes(_signer)) otherSigners.push(_signer);
  });
  return otherSigners;
};

export const getAccountsByNetworkName = async (
  networkName: NetworkNames
): Promise<EnkryptAccount[]> => {
  const network = await getNetworkByName(networkName);

  if (!network) return [];

  const keyring = new PublicKeyRing();

  const accounts = await keyring.getAccounts(network.signer);

  return accounts.filter((account) => {
    if (account.isHardware && account.HWOptions !== undefined) {
      // Polkadot and Kusama ledger apps only work for those networks
      if (
        account.HWOptions.networkName === NetworkNames.Kusama ||
        account.HWOptions.networkName === NetworkNames.Polkadot
      ) {
        return account.HWOptions.networkName === networkName;
      }
    }

    return true;
  });
};

export { getOtherSigners };
