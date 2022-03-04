import type {
  Signer as SignerInterface,
  SignerResult,
} from "@polkadot/api/types";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";
import { InjectedSendMessageHandler, InjectLibOptions } from "../types";

// External to class, this.# is not private enough (yet)
// let nextId = 0;

export default class Signer implements SignerInterface {
  sendMessageHandler: InjectedSendMessageHandler;
  constructor(options: InjectLibOptions) {
    this.sendMessageHandler = options.sendMessageHandler;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async signPayload(_payload: SignerPayloadJSON): Promise<SignerResult> {
    return {
      id: 0,
      signature: "0xabc",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async signRaw(payload: SignerPayloadRaw): Promise<SignerResult> {
    return {
      id: 0,
      signature: "0xabc",
    };
  }
}
