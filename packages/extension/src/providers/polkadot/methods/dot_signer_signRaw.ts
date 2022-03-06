import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import WindowPromise from "@/libs/window-promise";
import BrowserStorage from "@/libs/common/browser-storage";
import KeyRing from "@enkryptcom/keyring";
import { InternalStorageNamespace, ProviderRPCRequest } from "@/types/provider";
import { polkadotEncodeAddress, utf8ToHex } from "@enkryptcom/utils";
import { isAscii, u8aToString, u8aUnwrapBytes } from "@polkadot/util";
import { SignerPayloadRaw } from "@polkadot/types/types";
import { getCustomError } from "@/libs/error";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "dot_signer_signRaw") return next();
  else {
    const storage = new BrowserStorage(InternalStorageNamespace.keyring);
    const kr = new KeyRing(storage);
    if (!payload.params?.length)
      return res(getCustomError("Missing Params: signer_signRaw"));
    const reqPayload = payload.params[0] as SignerPayloadRaw;
    if (reqPayload.type !== "bytes")
      return res(getCustomError("type is not bytes: signer_signRaw"));
    const pAddress = polkadotEncodeAddress(reqPayload.address);
    kr.getKeysObject().then((keys) => {
      const key = keys[pAddress];
      kr.unlockMnemonic("test pass").then(() => {
        console.log(u8aToString(u8aUnwrapBytes(reqPayload.data)));
        const bytes = isAscii(reqPayload.data)
          ? utf8ToHex(u8aToString(u8aUnwrapBytes(reqPayload.data)))
          : reqPayload.data;
        kr.sign(bytes, {
          basePath: key.basePath,
          pathIndex: key.pathIndex,
          type: key.type,
        }).then((sig) => {
          res(null, sig);
        });
      });
    });
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
