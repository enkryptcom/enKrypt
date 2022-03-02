import type {
  InjectedMetadata,
  InjectedMetadataKnown,
  MetadataDef,
} from "@polkadot/extension-inject/types";

export default class Metadata implements InjectedMetadata {
  constructor() {}

  public get(): Promise<InjectedMetadataKnown[]> {
    console.log("metadata get called");
    return Promise.resolve([
      //   {
      //     genesisHash:
      //       "0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c",
      //     specVersion: 2034,
      //   },
    ]);
  }

  public provide(definition: MetadataDef): Promise<boolean> {
    console.log(definition);
    return Promise.resolve(true);
  }
}
