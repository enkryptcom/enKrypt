import { SignerType } from "@enkryptcom/types";
import { u8aToHex, u8aConcat, hexToU8a } from "@polkadot/util";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { GenericExtrinsicPayload } from "@polkadot/types";

export const TYPE_PREFIX = {
  ecdsa: new Uint8Array([2]),
  ed25519: new Uint8Array([0]),
  ethereum: new Uint8Array([2]),
  sr25519: new Uint8Array([1]),
};
export const SIG_TYPE_NONE = new Uint8Array();

export const payloadSignTransform = (
  sig: string,
  type: SignerType,
  withType: boolean
): string => {
  return u8aToHex(
    u8aConcat(
      withType ? (TYPE_PREFIX as any)[type] : SIG_TYPE_NONE,
      hexToU8a(sig)
    )
  );
};
export const signPayload = (
  extType: GenericExtrinsicPayload
): `0x${string}` => {
  const u8a = extType.toU8a({ method: true });
  const encoded = u8a.length > 256 ? extType.registry.hash(u8a) : u8a;
  return u8aToHex(encoded);
};
export { polkadotEncodeAddress };
