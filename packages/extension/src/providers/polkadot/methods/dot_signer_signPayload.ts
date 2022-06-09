import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import { WindowPromise } from "@/libs/window-promise";
import { ProviderRPCRequest } from "@/types/provider";
import { SignerPayloadJSON } from "@polkadot/types/types";
import { TypeRegistry } from "@polkadot/types";
import {
  polkadotEncodeAddress,
  signPayload,
  payloadSignTransform,
} from "../libs/signing-utils";
import { getCustomError } from "@/libs/error";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "dot_signer_signPayload") return next();
  else {
    if (!payload.params?.length)
      return res(getCustomError("Missing Params: signer_signPayload"));
    const reqPayload = payload.params[0] as SignerPayloadJSON;
    this.KeyRing.getAccount(polkadotEncodeAddress(reqPayload.address))
      .then((account) => {
        // const registry = new TypeRegistry();
        // registry.setSignedExtensions(reqPayload.signedExtensions);
        // const extType = registry.createType("ExtrinsicPayload", reqPayload, {
        //   version: reqPayload.version,
        // });
        // const signMsg = signPayload(extType);
        const windowPromise = new WindowPromise();
        windowPromise
          .getResponse(
            this.getUIPath(this.UIRoutes.dotTxApprove.path),
            JSON.stringify({
              ...payload,
              params: [reqPayload, account],
            }),
            true
          )
          .then(({ error, result }) => {
            if (error) return res(error);
            const signed = payloadSignTransform(
              JSON.parse(result as string),
              account.type,
              true
            );
            res(null, signed);
          });
      })
      .catch(res);
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
