import { MiddlewareFunction, SignerType } from "@enkryptcom/types";
import type EthereumProvider from "..";
import { ProviderRPCRequest } from "@/types/provider";
import { getCustomError } from "@/libs/error";
import openOnboard from "@/libs/utils/open-onboard";
import { throttle } from "lodash";

const throttledOpenOnboard = throttle(() => openOnboard(), 10000);

const method: MiddlewareFunction = async function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): Promise<void> {
  if (payload.method !== "enkrypt_getPublicKey") return next();
  else {
    const whitelistDomains = ["localhost", "raffle.enkrypt.com"];
    if (!whitelistDomains.includes(payload.options?.domain || "".toLowerCase()))
      return res(getCustomError("Cannot call this method from this domain"));
    const isInitialized = await this.KeyRing.isInitialized();
    if (!isInitialized) {
      throttledOpenOnboard();
      return res(getCustomError("Enkrypt not initialized"));
    } else {
      this.KeyRing.getAccounts([SignerType.secp256k1]).then((accounts) => {
        res(null, accounts[0].publicKey);
      });
    }
  }
};
export default method;
