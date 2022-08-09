import { decodePair } from "@polkadot/keyring/pair/decode";
import type { KeyringPair$Json } from "@polkadot/keyring/types";
import { hexToU8a, isHex, u8aToHex } from "@polkadot/util";
import { PolkadotSignerTypes } from "../types";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { KeyPairAdd, SignerType } from "@enkryptcom/types";

const getAccountFromJSON = (
  json: KeyringPair$Json,
  password: string
): KeyPairAdd => {
  if (!json.encoding) throw new Error("Invalid substrate keystore file");
  const cryptoType = Array.isArray(json.encoding.content)
    ? json.encoding.content[1]
    : "ed25519";
  const encType = Array.isArray(json.encoding.type)
    ? json.encoding.type
    : [json.encoding.type];
  const pair = decodePair(
    password,
    isHex(json.encoded)
      ? hexToU8a(json.encoded)
      : Buffer.from(json.encoded, "base64"),
    encType
  );
  if (
    ![SignerType.ecdsa, SignerType.ed25519, SignerType.sr25519].includes(
      cryptoType as SignerType
    )
  )
    throw new Error("substrate-keystore: invalid signer type");
  return {
    address: polkadotEncodeAddress(json.address),
    publicKey: u8aToHex(pair.publicKey),
    privateKey: u8aToHex(pair.secretKey),
    signerType: cryptoType as PolkadotSignerTypes,
    name: (json.meta?.name as string) || "",
  };
};

export { getAccountFromJSON };
