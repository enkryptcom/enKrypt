import { MiddlewareFunction } from "@enkryptcom/types";
import SubstrateProvider from "..";
import { WindowPromise } from "@/libs/window-promise";
import { ProviderRPCRequest } from "@/types/provider";
import { SignerPayloadJSON } from "@polkadot/types/types";
import { polkadotEncodeAddress } from "../libs/signing-utils";
import { getCustomError } from "@/libs/error";
const method: MiddlewareFunction = function (
  this: SubstrateProvider,
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
            res(null, JSON.parse(result as string));
          });
      })
      .catch(res);
  }
};
export default method;
