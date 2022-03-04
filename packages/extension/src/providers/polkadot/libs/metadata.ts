import type {
  InjectedMetadata,
  InjectedMetadataKnown,
  MetadataDef,
} from "@polkadot/extension-inject/types";
import { InjectedSendMessageHandler, InjectLibOptions } from "../types";

export default class Metadata implements InjectedMetadata {
  sendMessageHandler: InjectedSendMessageHandler;
  id: number;
  constructor(options: InjectLibOptions) {
    this.sendMessageHandler = options.sendMessageHandler;
    this.id = options.id;
  }

  public get(): Promise<InjectedMetadataKnown[]> {
    console.log("metadata get called");
    return this.sendMessageHandler(this.id, {
      method: "dot_metadata_get",
    });
  }

  public provide(definition: MetadataDef): Promise<boolean> {
    console.log(definition);
    return Promise.resolve(true);
  }
}
