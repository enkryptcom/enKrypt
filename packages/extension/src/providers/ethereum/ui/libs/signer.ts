import { InternalMethods, InternalOnMessageResponse } from "@/types/messenger";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { SignerTransactionOptions, SignerMessageOptions } from "../types";
import HWwallet from "@enkryptcom/hw-wallets";
import { HWwalletType } from "@enkryptcom/types";
import { bufferToHex, fromRpcSig, hashPersonalMessage } from "ethereumjs-util";
import { getCustomError } from "@/libs/error";
import { hexToBuffer } from "@enkryptcom/utils";

const TransactionSigner = (
  options: SignerTransactionOptions
): Promise<FeeMarketEIP1559Transaction> => {
  const { account, network, sendToBackground, payload } = options;
  if (account.isHardware) {
    const hwwallets = new HWwallet();
    return hwwallets
      .signTransaction({
        transaction: payload as any,
        networkName: network.name,
        pathIndex: account.pathIndex.toString(),
        pathType: {
          basePath: account.basePath,
          path: account.HWOptions!.pathTemplate,
        },
        wallet: account.walletType as unknown as HWwalletType,
      })
      .then((rpcsig: string) => {
        const rpcSig = fromRpcSig(rpcsig);
        const signedTx = (
          payload as FeeMarketEIP1559Transaction
        )._processSignature(rpcSig.v, rpcSig.r, rpcSig.s);
        return signedTx;
      })
      .catch((e) => {
        throw new Error(JSON.stringify(getCustomError(e.message)));
      });
  } else {
    const msgHash = bufferToHex(payload.getMessageToSign(true));
    return sendToBackground({
      method: InternalMethods.sign,
      params: [msgHash, account],
    })
      .then((res) => {
        if (res.error) {
          throw new Error(JSON.stringify(res.error));
        } else {
          const rpcSig = fromRpcSig(res.result || "0x");
          const signedTx = (
            payload as FeeMarketEIP1559Transaction
          )._processSignature(rpcSig.v, rpcSig.r, rpcSig.s);
          return signedTx;
        }
      })
      .catch((e) => {
        throw new Error(JSON.stringify(getCustomError(e.message)));
      });
  }
};

const MessageSigner = (
  options: SignerMessageOptions
): Promise<InternalOnMessageResponse> => {
  const { account, network, sendToBackground, payload } = options;
  if (account.isHardware) {
    const hwwallets = new HWwallet();
    return hwwallets
      .signPersonalMessage({
        message: payload,
        networkName: network.name,
        pathIndex: account.pathIndex.toString(),
        pathType: {
          basePath: account.basePath,
          path: account.HWOptions!.pathTemplate,
        },
        wallet: account.walletType as unknown as HWwalletType,
      })
      .then((res: string) => ({
        result: JSON.stringify(res),
      }))
      .catch((e: any) => ({ error: getCustomError(e) }));
  } else {
    const msgHash = bufferToHex(hashPersonalMessage(payload));
    return sendToBackground({
      method: InternalMethods.sign,
      params: [msgHash, account],
    }).then((res) => {
      if (res.error) return res;
      return {
        result: JSON.stringify(res.result),
      };
    });
  }
};

export { TransactionSigner, MessageSigner };
