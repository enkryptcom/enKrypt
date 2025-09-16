import varint from "varint";
import { Versioner, Version } from "./interfaces/versioner";

/**
 * Varint-based implementation of the Versioner interface.
 */
export default class VarintVersioner implements Versioner {
  /**
   * Prepends the version to the data.
   *
   * @param version - The version to attach.
   * @param data - The data to attach the version to.
   *
   * @returns The versioned data.
   */
  // eslint-disable-next-line class-methods-use-this -- Expected by the interface.
  attach(version: Version, data: Uint8Array): Uint8Array {
    const versionArray = varint.encode(version);
    return new Uint8Array([...versionArray, ...data]);
  }

  /**
   * Extracts the version from the data.
   *
   * @param data - The versioned data.
   *
   * @returns The version and the data.
   */
  // eslint-disable-next-line class-methods-use-this -- Expected by the interface.
  extract(data: Uint8Array): { version: Version; data: Uint8Array } {
    const version = varint.decode(data);
    return { data: data.slice(varint.decode.bytes), version };
  }
}
