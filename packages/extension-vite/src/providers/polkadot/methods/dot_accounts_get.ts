import {
  CallbackFunction,
  MiddlewareFunction,
  SignerType,
} from "@enkryptcom/types";
import SubstrateProvider from "..";
import { WindowPromise } from "@/libs/window-promise";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import AccountState from "../libs/accounts-state";
import { ProviderRPCRequest } from "@/types/provider";
import { getCustomError } from "@/libs/error";

let isAccountAccessPending = false;
const pendingPromises: {
  payload: ProviderRPCRequest;
  res: CallbackFunction;
}[] = [];
const method: MiddlewareFunction = function (
  this: SubstrateProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "dot_accounts_get") return next();
  else {
    if (isAccountAccessPending) {
      pendingPromises.push({
        payload,
        res,
      });
      return;
    }
    isAccountAccessPending = true;
    const handleRemainingPromises = () => {
      isAccountAccessPending = false;
      if (pendingPromises.length) {
        const promi = pendingPromises.pop();
        if (promi) handleAccountAccess(promi.payload, promi.res);
      }
    };
    const getAccounts = () => {
      const publicKeyring = new PublicKeyRing();
      return publicKeyring
        .getAccounts([SignerType.ed25519, SignerType.sr25519])
        .then((acc) => {
          return acc.map((acc) => {
            return {
              address: acc.address,
              genesisHash: "",
              name: acc.name,
              type: acc.signerType,
            };
          });
        });
    };
    const handleAccountAccess = (
      _payload: ProviderRPCRequest,
      _res: CallbackFunction
    ) => {
      if (_payload.options && _payload.options.domain) {
        isAccountAccessPending = true;
        const accountsState = new AccountState();
        accountsState.isApproved(_payload.options.domain).then((isApproved) => {
          if (isApproved) {
            getAccounts().then((acc) => {
              _res(null, acc);
              handleRemainingPromises();
            });
          } else {
            const windowPromise = new WindowPromise();
            windowPromise
              .getResponse(
                this.getUIPath(this.UIRoutes.dotAccounts.path),
                JSON.stringify(payload)
              )
              .then(({ error }) => {
                if (error) res(error);
                else getAccounts().then((acc) => res(null, acc));
              })
              .finally(handleRemainingPromises);
          }
        });
      } else {
        _res(getCustomError("No domain set!"));
      }
    };
    handleAccountAccess(payload, res);
  }
};
export default method;
