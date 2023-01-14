import { getCustomError } from "@/libs/error";
import { WindowPromise } from "@/libs/window-promise";
import { MiddlewareFunction } from "@enkryptcom/types";
import { toBN } from "web3-utils";
import EthereumProvider from "..";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  const supportedMethods: Record<string, string> = {
    eth_signTypedData: "V1",
    eth_signTypedData_v1: "V1",
    eth_signTypedData_v3: "V3",
    eth_signTypedData_v4: "V4",
  };
  if (!Object.keys(supportedMethods).includes(payload.method)) return next();
  else {
    if (!payload.params || payload.params.length < 2) {
      return res(getCustomError("eth_signTypedData: invalid params"));
    }
    const version = supportedMethods[payload.method as string];
    const typedData = version === "V1" ? payload.params[0] : payload.params[1];
    const address = version === "V1" ? payload.params[1] : payload.params[0];
    const typedDataJSON = version !== "V1" ? JSON.parse(typedData) : typedData;

    if (
      typedDataJSON.domain &&
      typedDataJSON.domain.chainId &&
      !toBN(typedDataJSON.domain.chainId).eq(toBN(this.network.chainID))
    )
      return res(
        getCustomError(
          `eth_signTypedData: Provided chainId ${
            typedDataJSON.domain.chainId
          } must match the active chainId ${toBN(
            this.network.chainID
          ).toString()}`,
          -32603
        )
      );
    this.KeyRing.getAccount(address.toLowerCase()).then((account) => {
      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.ethSignTypedData.path),
          JSON.stringify({
            ...payload,
            params: [typedDataJSON, account, version, this.network.name],
          }),
          true
        )
        .then(({ error, result }) => {
          if (error) return res(error);
          res(null, JSON.parse(result as string));
        });
    });
  }
};
export default method;
