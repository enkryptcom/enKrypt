import type {
  InjectedMetadata,
  InjectedMetadataKnown,
  MetadataDef,
} from "@polkadot/extension-inject/types";

export default class Metadata implements InjectedMetadata {
  constructor() {
    // sendRequest = _sendRequest;
  }

  public get(): Promise<InjectedMetadataKnown[]> {
    // return sendRequest("pub(metadata.list)");
  }

  public provide(definition: MetadataDef): Promise<boolean> {
    // return sendRequest("pub(metadata.provide)", definition);
  }
}
