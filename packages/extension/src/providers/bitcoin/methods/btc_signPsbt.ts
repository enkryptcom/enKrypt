import { MiddlewareFunction } from "@enkryptcom/types";
import { ProviderName, ProviderRPCRequest } from "@/types/provider";
import AccountState from "../libs/accounts-state";
import { getCustomError } from "@/libs/error";
import BitcoinProvider from "..";
import { Psbt, address } from "bitcoinjs-lib";
import { hexToBuffer } from "@enkryptcom/utils";
import { InternalMethods } from "@/types/messenger";
import { bufferToHex } from "ethereumjs-util";
import { sendToBackgroundFromBackground } from "@/libs/messenger/extension";

const method: MiddlewareFunction = function (
  this: BitcoinProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "btc_signPsbt") return next();
  else {
    if (payload.options && payload.options.domain) {
      const accountsState = new AccountState();
      accountsState
        .getApprovedAddresses(payload.options.domain)
        .then((accounts) => {
          if (accounts.length) {
            this.KeyRing.getAccount(accounts[0])
              .then(async (pubAccount) => {
                const hex = payload.params![0];
                const newPsbt = Psbt.fromHex(hex, {
                  maximumFeeRate: this.network.networkInfo.maxFeeRate,
                  network: this.network.networkInfo,
                });
                console.log(newPsbt);
                const signer = {
                  publicKey: hexToBuffer(pubAccount.address),
                  network: this.network.networkInfo,
                  sign: (hash: Buffer): Promise<Buffer> => {
                    return sendToBackgroundFromBackground({
                      provider: ProviderName.enkrypt,
                      message: JSON.stringify({
                        method: InternalMethods.sign,
                        params: [bufferToHex(hash), pubAccount],
                      }),
                    }).then((res) => {
                      console.log("res", res);
                      if (res.error) {
                        return Promise.reject({
                          error: res.error,
                        });
                      } else {
                        return hexToBuffer(JSON.parse(res.result!)).subarray(
                          0,
                          64
                        );
                      }
                    });
                  },
                };

                for (let i = 0; i < newPsbt.data.inputs.length; i++) {
                  console.log(
                    "signing",
                    i,
                    bufferToHex(newPsbt.data.inputs[i].witnessUtxo!.script)
                  );
                  if (
                    newPsbt.inputHasPubkey(i, hexToBuffer(pubAccount.address))
                  ) {
                    await newPsbt.signInputAsync(
                      i,
                      signer,
                      newPsbt.data.inputs[i].sighashType
                        ? [newPsbt.data.inputs[i].sighashType!]
                        : undefined
                    );
                    // newPsbt.finalizeInput(i);
                  }
                }
                res(null, newPsbt.toHex());

                //   newPsbt.signAllInputsAsync(signer).then(() => {
                //     // newPsbt.finalizeAllInputs();
                //     console.log(newPsbt.toHex());
                //   });
              })
              .catch(() => {
                res(null, "");
              });
          } else {
            res(null, "");
          }
        });
    } else {
      res(getCustomError("No domain set!"));
    }
  }
};
export default method;
