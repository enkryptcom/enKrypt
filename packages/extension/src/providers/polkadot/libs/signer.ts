import type {
  Signer as SignerInterface,
  SignerResult,
} from "@polkadot/api/types";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";

// External to class, this.# is not private enough (yet)
// let nextId = 0;

export default class Signer implements SignerInterface {
  constructor() {
    // sendRequest = _sendRequest;
  }

  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    return {
      id: 0,
      signature: "0xabc",
    };
  }

  public async signRaw(payload: SignerPayloadRaw): Promise<SignerResult> {
    return {
      id: 0,
      signature: "0xabc",
    };
  }
}
