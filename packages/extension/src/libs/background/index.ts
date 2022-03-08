import { InternalMethods, InternalOnMessageResponse } from "@/types/messenger";

import { KeyRecord, RPCRequestType } from "@enkryptcom/types";
import { getCustomError } from "../error";
import KeyRingBase from "../keyring/keyring";
class BackgroundHandler {
  #keyring: KeyRingBase;
  constructor() {
    this.#keyring = new KeyRingBase();
  }
  internalHandler(message: RPCRequestType): Promise<InternalOnMessageResponse> {
    if (message.method === InternalMethods.sign) {
      if (!message.params || message.params.length < 2)
        return Promise.resolve({
          error: getCustomError("background: invalid params for signing"),
        });
      const msgHash = message.params[0] as `0x${string}`;
      const account = message.params[1] as KeyRecord;
      return this.#keyring
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
    } else if (message.method === InternalMethods.unlock) {
      if (!message.params || message.params.length < 1)
        return Promise.resolve({
          error: getCustomError("background: invalid params for unlocking"),
        });
      const password = message.params[0] as string;
      return this.#keyring
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
    } else if (message.method === InternalMethods.isLocked) {
      return Promise.resolve({
        result: JSON.stringify(this.#keyring.isLocked()),
      });
    } else {
      return Promise.resolve({
        error: getCustomError(`background: unknown method: ${message.method}`),
      });
    }
  }
}

export default BackgroundHandler;
