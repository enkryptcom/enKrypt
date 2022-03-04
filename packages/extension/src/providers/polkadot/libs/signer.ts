import type {
  Signer as SignerInterface,
  SignerResult,
} from "@polkadot/api/types";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";
import { InjectedSendMessageHandler, InjectLibOptions } from "../types";

let nextId = 0;
export default class Signer implements SignerInterface {
  sendMessageHandler: InjectedSendMessageHandler;
  id: number;
  constructor(options: InjectLibOptions) {
    this.sendMessageHandler = options.sendMessageHandler;
    this.id = options.id;
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
    return this.sendMessageHandler(this.id, {
      method: "dot_signer_signRaw",
      params: [payload],
    }).then((sig) => {
      nextId++;
      return {
        signature: sig,
        id: nextId,
      };
    });
  }
}
