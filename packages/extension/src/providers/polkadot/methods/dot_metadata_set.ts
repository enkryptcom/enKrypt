import { MiddlewareFunction } from "@enkryptcom/types";
import SubstrateProvider from "..";
import { ProviderRPCRequest } from "@/types/provider";
import { getCustomError } from "@/libs/error";
import { WindowPromise } from "@/libs/window-promise";
import { MetadataDef } from "@polkadot/extension-inject/types";
const method: MiddlewareFunction = function (
  this: SubstrateProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "dot_metadata_set") return next();
  else {
    if (!payload.params?.length)
      return res(getCustomError("Missing Params: dot_metadata_get"));
    const reqPayload = payload.params[0] as MetadataDef;
    const windowPromise = new WindowPromise();
    windowPromise
      .getResponse(
        this.getUIPath(this.UIRoutes.dotUpdateMetadata.path),
        JSON.stringify({
          ...payload,
          params: [reqPayload],
        }),
        false
      )
      .then(({ error, result }) => {
        if (error) return res(error);
        res(null, JSON.parse(result as string));
      });
  }
};
export default method;
