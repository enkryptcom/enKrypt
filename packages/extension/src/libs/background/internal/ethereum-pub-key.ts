import { getCustomError } from "@/libs/error";
import KeyRingBase from "@/libs/keyring/keyring";
import { InternalOnMessageResponse } from "@/types/messenger";
import { EnkryptAccount, RPCRequestType } from "@enkryptcom/types";

const getEthereumPubKey = (
  keyring: KeyRingBase,
  message: RPCRequestType
): Promise<InternalOnMessageResponse> => {
  if (!message.params || message.params.length < 1)
    return Promise.resolve({
      error: getCustomError("background: invalid params for public key"),
    });
  const account = message.params[0] as EnkryptAccount;
  return keyring
    .getEthereumEncryptionPublicKey(account)
    .then((pubkey) => {
      return {
        result: JSON.stringify(pubkey),
      };
    })
    .catch((e) => {
      return {
        error: getCustomError(e.message),
      };
    });
};

export default getEthereumPubKey;
