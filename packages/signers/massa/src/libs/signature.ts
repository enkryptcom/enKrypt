import Base58 from "../crypto/base58";
import Serializer from "../crypto/interfaces/serializer";
import { Version, Versioner } from "../crypto/interfaces/versioner";
import VarintVersioner from "../crypto/varintVersioner";

const DEFAULT_VERSION = Version.V0;

/**
 * Get the signature version.
 *   *
 * @returns the signature version.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getVersion(_data: string | Uint8Array): Version {
  // when a new version will come, implement the logic to detect version here
  // This should be done without serializer and versionner as they are potentially not known at this point
  return Version.V0;
}

/**
 * A class representing a signature.
 */
export class Signature {
  // The signature in byte format. Version included.
  private bytes: Uint8Array;

  protected constructor(
    public serializer: Serializer,
    public versioner: Versioner,
    public version: Version,
  ) {}

  /**
   * Initializes a new signature object from a version.
   *
   * @param version - The version of the signature.
   *
   * @returns A new signature instance.
   */
  protected static initFromVersion(
    version: Version = DEFAULT_VERSION,
  ): Signature {
    switch (version) {
      case Version.V0:
        return new Signature(new Base58(), new VarintVersioner(), version);
      default:
        throw new Error(`unsupported version: ${version}`);
    }
  }

  /**
   * Initializes a new signature object from a serialized string.
   *
   * @param str - The serialized signature string.
   *
   * @returns A new signature instance.
   *
   * @throws If the signature string is invalid.
   */
  public static fromString(str: string): Signature {
    const version = getVersion(str);
    const signature = Signature.initFromVersion(version);

    try {
      signature.bytes = signature.serializer.deserialize(str);
      const { version: extractedVersion } = signature.versioner.extract(
        signature.bytes,
      );

      // safety check
      if (extractedVersion !== version) {
        throw new Error(
          `invalid version: ${version}. ${signature.version} was expected.`,
        );
      }
    } catch (e) {
      throw new Error(`invalid signature string: ${e.message}`);
    }

    return signature;
  }

  /**
   * Initializes a signature object from a byte array.
   *
   * @param bytes - The signature bytes.
   *
   * @returns A signature object.
   */
  public static fromBytes(bytes: Uint8Array): Signature {
    const version = getVersion(bytes);
    const signature = Signature.initFromVersion(version);
    signature.bytes = bytes;

    // safety check
    const { version: extractedVersion } = signature.versioner.extract(bytes);
    if (extractedVersion !== version) {
      throw new Error(
        `invalid version: ${version}. ${signature.version} was expected.`,
      );
    }
    return signature;
  }

  /**
   * Get signature in bytes format.
   *
   * @returns The versioned signature key bytes.
   */
  public toBytes(): Uint8Array {
    return this.bytes;
  }

  /**
   * Serializes the signature to a string.
   *
   * @returns The serialized signature string.
   */
  public toString(): string {
    return this.serializer.serialize(this.bytes);
  }
}
