import { getCustomError } from "@/libs/error";
import KeyRingBase from "@/libs/keyring/keyring";
import { InternalOnMessageResponse } from "@/types/messenger";
import { RPCRequestType } from "@enkryptcom/types";

const unlock = (
  keyring: KeyRingBase,
  message: RPCRequestType
): Promise<InternalOnMessageResponse> => {
  if (!message.params || message.params.length < 1)
    return Promise.resolve({
      error: getCustomError("background: invalid params for unlocking"),
    });
  const password = message.params[0] as string;
  return keyring
    .unlock(password)
    .then(() => {
      return {
        result: JSON.stringify(true),
      };
    })
    .catch((e) => {
      return {
        error: getCustomError(e.message),
      };
    });
};

export default unlock;
