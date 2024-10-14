import { getCustomError } from "@/libs/error";
import KeyRingBase from "@/libs/keyring/keyring";
import { InternalOnMessageResponse } from "@/types/messenger";
import { EnkryptAccount, RPCRequestType } from "@enkryptcom/types";

const ethereumDecrypt = (
  keyring: KeyRingBase,
  message: RPCRequestType
): Promise<InternalOnMessageResponse> => {
  if (!message.params || message.params.length < 2)
    return Promise.resolve({
      error: getCustomError("background: invalid params for decrypt"),
    });
  const encryptedMessage = message.params[0] as string;
  const account = message.params[1] as EnkryptAccount;
  return keyring
    .ethereumDecrypt(encryptedMessage, account)
    .then((msg) => {
      return {
        result: JSON.stringify(msg),
      };
    })
    .catch((e) => {
      return {
        error: getCustomError(e.message),
      };
    });
};

export default ethereumDecrypt;
