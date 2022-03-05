import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import WindowPromise from "@/libs/window-promise";
import BrowserStorage from "@/libs/common/browser-storage";
import KeyRing from "@enkryptcom/keyring";
import { InternalStorageNamespace, ProviderRPCRequest } from "@/types/provider";
import {
  polkadotEncodeAddress,
  utf8ToHex,
  bytesToHex,
} from "@enkryptcom/utils";
import {
  isAscii,
  u8aToString,
  u8aUnwrapBytes,
  u8aToHex,
  u8aConcat,
  hexToU8a,
} from "@polkadot/util";
import { SignerPayloadJSON, SignerPayloadRaw } from "@polkadot/types/types";
import { TypeRegistry } from "@polkadot/types";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "dot_signer_signPayload") return next();
  else {
    const storage = new BrowserStorage(InternalStorageNamespace.keyring);
    const kr = new KeyRing(storage);
    if (!payload.params?.length)
      return res(new Error("Missing Params: signer_signPayload"));
    console.log(payload);
    const reqPayload = payload.params[0] as SignerPayloadJSON;
    const registry = new TypeRegistry();

    // const currentMetadata = this.#state.knownMetadata.find(
    //   (meta: MetadataDef) => meta.genesisHash === payload.genesisHash
    // );
    //  if (currentMetadata) {
    //    registry.register(currentMetadata?.types);
    //  }

    registry.setSignedExtensions(reqPayload.signedExtensions);
    const pAddress = polkadotEncodeAddress(reqPayload.address);
    const TYPE_PREFIX = {
      ecdsa: new Uint8Array([2]),
      ed25519: new Uint8Array([0]),
      ethereum: new Uint8Array([2]),
      sr25519: new Uint8Array([1]),
    };
    const SIG_TYPE_NONE = new Uint8Array();
    kr.getKeysObject().then((keys) => {
      const key = keys[pAddress];
      kr.unlockMnemonic("test pass").then(() => {
        const extType = registry.createType("ExtrinsicPayload", reqPayload, {
          version: reqPayload.version,
        });
        extType.sign({
          sign: (data, options): any => {
            kr.sign(u8aToHex(data), {
              basePath: key.basePath,
              pathIndex: key.pathIndex,
              type: key.type,
            }).then((sig) => {
              console.log(
                sig,
                u8aToHex(u8aConcat(new Uint8Array([1]), hexToU8a(sig)))
              );
              res(
                null,
                u8aToHex(
                  u8aConcat(
                    options?.withType
                      ? (TYPE_PREFIX as any)[key.type]
                      : SIG_TYPE_NONE,
                    hexToU8a(sig)
                  )
                )
              );
            });
          },
          address: "",
          addressRaw: new Uint8Array([1]),
          publicKey: new Uint8Array([1]),
        });
        // const extBytes = extType.toU8a({ method: true });
        // console.log(extBytes.length);
        // const signBytes =
        //   extBytes.length > 256 ? registy.hash(extBytes) : extBytes;
        // console.log(u8aToHex(signBytes), key, 2);
        // kr.sign(u8aToHex(signBytes), {
        //   basePath: key.basePath,
        //   pathIndex: key.pathIndex,
        //   type: key.type,
        // }).then((sig) => {
        //   console.log(
        //     sig,
        //     u8aToHex(u8aConcat(new Uint8Array([1]), hexToU8a(sig)))
        //   );
        //   res(null, u8aToHex(u8aConcat(new Uint8Array([1]), hexToU8a(sig))));
        // });
      });
    });

    // export function sign(registry, signerPair, u8a, options) {
    //   const encoded = u8a.length > 256 ? registry.hash(u8a) : u8a;
    //   return signerPair.sign(encoded, options);
    // }
    // return sign(
    //   this.registry,
    //   signerPair,
    //   this.toU8a({
    //     method: true,
    //   }),
    //   this.#signOptions
    // );
    // const windowPromise = new WindowPromise();
    // windowPromise
    //   .getResponse("index.html#/polkadot/dotaccounts", JSON.stringify(payload))
    //   .then(({ error, result }) => {
    //     if (error) res(JSON.parse(error));
    //     res(null, JSON.parse(result || "[]"));
    //   });
  }
};
export default method;

// if (isJsonPayload(payload)) {
//   // Get the metadata for the genesisHash
//   const currentMetadata = this.#state.knownMetadata.find(
//     (meta: MetadataDef) => meta.genesisHash === payload.genesisHash
//   );

//   // set the registry before calling the sign function
//   registry.setSignedExtensions(
//     payload.signedExtensions,
//     currentMetadata?.userExtensions
//   );

//   if (currentMetadata) {
//     registry.register(currentMetadata?.types);
//   }
// }

// const result = request.sign(registry, pair);
