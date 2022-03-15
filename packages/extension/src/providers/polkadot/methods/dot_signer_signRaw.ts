import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import { ProviderRPCRequest } from "@/types/provider";
import { polkadotEncodeAddress, utf8ToHex } from "@enkryptcom/utils";
import { isAscii, u8aToString, u8aUnwrapBytes } from "@polkadot/util";
import { SignerPayloadRaw } from "@polkadot/types/types";
import { getCustomError } from "@/libs/error";
import { WindowPromise } from "@/libs/window-promise";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "dot_signer_signRaw") return next();
  else {
    if (!payload.params?.length)
      return res(getCustomError("Missing Params: signer_signPayload"));
    const reqPayload = payload.params[0] as SignerPayloadRaw;
    if (reqPayload.type !== "bytes")
      return res(getCustomError("type is not bytes: signer_signRaw"));
    this.KeyRing.getAccount(polkadotEncodeAddress(reqPayload.address)).then(
      (account) => {
        const bytes = isAscii(reqPayload.data)
          ? utf8ToHex(u8aToString(u8aUnwrapBytes(reqPayload.data)))
          : reqPayload.data;
        const windowPromise = new WindowPromise();
        windowPromise
          .getResponse(
            this.getUIPath(this.UIRoutes.dotMsgSignApprove.path),
            JSON.stringify({
              ...payload,
              params: [bytes, account],
            }),
            true
          )
          .then(({ error, result }) => {
            if (error) return res(error);
            res(null, JSON.parse(result as string));
          });
      }
    );
  }
};
export default method;
