import { MiddlewareFunction, SignerType } from "@enkryptcom/types";
import type EthereumProvider from "..";
import { WindowPromise } from "@/libs/window-promise";
import { ProviderRPCRequest } from "@/types/provider";
import PublicKeyRing from "@/libs/keyring/public-keyring";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (
    payload.method !== "eth_accounts" &&
    payload.method !== "eth_requestAccounts"
  )
    return next();
  else {
    // const windowPromise = new WindowPromise();
    // windowPromise
    //   .getResponse(
    //     this.getUIPath(this.UIRoutes.ethAccounts.path),
    //     JSON.stringify(payload)
    //   )
    //   .then(({ error, result }) => {
    //     if (error) res(error as any);
    //     res(null, JSON.parse(result || "[]"));
    //   });
    const kr = new PublicKeyRing();
    kr.getAccounts([SignerType.secp256k1]).then((accounts) => {
      res(
        null,
        accounts.map((acc) => acc.address)
      );
    });
  }
};
export default method;
