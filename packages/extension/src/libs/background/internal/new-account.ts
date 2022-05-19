import { getCustomError } from "@/libs/error";
import KeyRingBase from "@/libs/keyring/keyring";
import { InternalMethods, InternalOnMessageResponse } from "@/types/messenger";
import { KeyRecordAdd, RPCRequestType } from "@enkryptcom/types";

const newAccount = (
  keyring: KeyRingBase,
  message: RPCRequestType
): Promise<InternalOnMessageResponse> => {
  if (!message.params || message.params.length < 1)
    return Promise.resolve({
      error: getCustomError("background: invalid params for new account"),
    });
  const method =
    message.method === InternalMethods.getNewAccount
      ? "getNewAccount"
      : "saveNewAccount";
  const keyrecord = message.params[0] as KeyRecordAdd;
  return keyring[method](keyrecord)
    .then((res) => {
      return {
        result: JSON.stringify(res),
      };
    })
    .catch((e) => {
      return {
        error: getCustomError(e.message),
      };
    });
};

export default newAccount;
