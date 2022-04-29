import { getCustomError } from "@/libs/error";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import { EthereumTransaction } from "../libs/transaction/types";
import { WindowPromise } from "@/libs/window-promise";
import { numberToHex } from "web3-utils";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "eth_sendTransaction") return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(
        getCustomError("eth_sendTransaction: invalid request not enough params")
      );
    }
    const tx = payload.params[0] as EthereumTransaction;
    if (!tx.chainId)
      tx.chainId = numberToHex(this.network.chainID) as `0x${string}`;
    this.KeyRing.getAccount(tx.from.toLowerCase()).then((account) => {
      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.ethSendTransaction.path),
          JSON.stringify({
            ...payload,
            params: [tx, account, this.network.name],
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
