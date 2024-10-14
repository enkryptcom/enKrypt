import { getCustomError } from "@/libs/error";
import KeyRingBase from "@/libs/keyring/keyring";
import { InternalOnMessageResponse } from "@/types/messenger";
import { EnkryptAccount, RPCRequestType } from "@enkryptcom/types";

const sign = (
  keyring: KeyRingBase,
  message: RPCRequestType
): Promise<InternalOnMessageResponse> => {
  if (!message.params || message.params.length < 2)
    return Promise.resolve({
      error: getCustomError("background: invalid params for signing"),
    });
  const msgHash = message.params[0] as `0x${string}`;
  const account = message.params[1] as EnkryptAccount;
  return keyring
    .sign(msgHash, account)
    .then((sig) => {
      return {
        result: JSON.stringify(sig),
      };
    })
    .catch((e) => {
      return {
        error: getCustomError(e.message),
      };
    });
};

export default sign;
