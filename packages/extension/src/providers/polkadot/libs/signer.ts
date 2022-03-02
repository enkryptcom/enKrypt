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
    // const id = ++nextId;
    // const result = await sendRequest("pub(extrinsic.sign)", payload);
    // // we add an internal id (number) - should have a mapping from the
    // // extension id (string) -> internal id (number) if we wish to provide
    // // updated via the update functionality (noop at this point)
    // return {
    //   ...result,
    //   id,
    // };
  }

  public async signRaw(payload: SignerPayloadRaw): Promise<SignerResult> {
    // const id = ++nextId;
    // const result = await sendRequest("pub(bytes.sign)", payload);
    // return {
    //   ...result,
    //   id,
    // };
  }
}
