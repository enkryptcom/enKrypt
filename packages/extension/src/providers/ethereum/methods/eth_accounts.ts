import { CallbackFunction, MiddlewareFunction } from "@enkryptcom/types";
import type EthereumProvider from "..";
import { ProviderRPCRequest } from "@/types/provider";
import { WindowPromise } from "@/libs/window-promise";
import AccountState from "../libs/accounts-state";
import { getCustomError } from "@/libs/error";
import openOnboard from "@/libs/utils/open-onboard";
let isAccountAccessPending = false;
import { throttle } from "lodash";

const throttledOpenOnboard = throttle(() => openOnboard(), 10000);
const existingErrors: Record<string, { time: number; error: any }> = {};
const pendingPromises: {
  payload: ProviderRPCRequest;
  res: CallbackFunction;
}[] = [];
const method: MiddlewareFunction = async function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): Promise<void> {
  if (
    payload.method !== "eth_accounts" &&
    payload.method !== "eth_requestAccounts" &&
    payload.method !== "eth_coinbase"
  )
    return next();
  else {
    if (isAccountAccessPending) {
      pendingPromises.push({
        payload,
        res,
      });
      return;
    }
    isAccountAccessPending = true;
    const isInitialized = await this.KeyRing.isInitialized();

    const handleRemainingPromises = () => {
      isAccountAccessPending = false;
      if (pendingPromises.length) {
        const promi = pendingPromises.pop();
        if (promi) handleAccountAccess(promi.payload, promi.res);
      }
    };
    const handleAccountAccess = (
      _payload: ProviderRPCRequest,
      _res: CallbackFunction
    ) => {
      if (_payload.options && _payload.options.domain) {
        isAccountAccessPending = true;
        if (!isInitialized) {
          _res(getCustomError("Enkrypt not initialized"));
          throttledOpenOnboard();
          return handleRemainingPromises();
        }
        const accountsState = new AccountState();
        if (
          existingErrors[_payload.options.domain] &&
          existingErrors[_payload.options.domain].time >
            new Date().getTime() - 2000
        ) {
          _res(existingErrors[_payload.options.domain].error as any);
          return handleRemainingPromises();
        }
        accountsState
          .getApprovedAddresses(_payload.options.domain)
          .then((accounts) => {
            if (accounts.length) {
              _res(
                null,
                payload.method === "eth_coinbase" ? accounts[0] : accounts
              );
              handleRemainingPromises();
            } else {
              const windowPromise = new WindowPromise();
              windowPromise
                .getResponse(
                  this.getUIPath(this.UIRoutes.ethConnectDApp.path),
                  JSON.stringify({
                    ..._payload,
                    params: [this.network.name],
                  })
                )
                .then(({ error, result }) => {
                  if (error) {
                    existingErrors[_payload.options!.domain] = {
                      time: new Date().getTime(),
                      error,
                    };
                    return _res(error as any);
                  }
                  const accounts = JSON.parse(result || "[]");
                  _res(
                    null,
                    payload.method === "eth_coinbase" ? accounts[0] : accounts
                  );
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
