import KeyRingBase from "@/libs/keyring/keyring";
import { InternalOnMessageResponse } from "@/types/messenger";

const lock = (keyring: KeyRingBase): Promise<InternalOnMessageResponse> => {
  keyring.lock();
  return Promise.resolve({
    result: JSON.stringify(true),
  });
};

export default lock;
