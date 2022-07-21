import { InternalMethods, InternalOnMessageResponse } from "@/types/messenger";
import { HWwalletType } from "@enkryptcom/types";
import HWwallet from "@enkryptcom/hw-wallets";
import { SignerMessageOptions, SignerTransactionOptions } from "../types";
import { getCustomError } from "@/libs/error";
import { payloadSignTransform, signPayload } from "../../libs/signing-utils";
import sendUsingInternalMessengers from "@/libs/messenger/internal-messenger";
import {
  isAscii,
  u8aToBuffer,
  u8aUnwrapBytes,
  u8aWrapBytes,
} from "@polkadot/util";
import { bufferToHex } from "ethereumjs-util";

const TransactionSigner = (
  options: SignerTransactionOptions
): Promise<InternalOnMessageResponse> => {
  const { account, network, payload } = options;
  if (account.isHardware) {
    const hwWallet = new HWwallet();
    return hwWallet
      .signTransaction({
        transaction: payload,
        networkName: network.name,
        pathIndex: account.pathIndex.toString(),
        pathType: {
          basePath: account.basePath,
          path: account.HWOptions!.pathTemplate,
        },
        wallet: account.walletType as unknown as HWwalletType,
      })
      .then((signature: string) => ({
        result: JSON.stringify(signature),
      }))
      .catch((e) => {
        return Promise.reject({
          error: getCustomError(e.message),
        });
      });
  } else {
    const signMsg = signPayload(payload);
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [signMsg, account],
    }).then((res) => {
      if (res.error) return res;

      const signed = payloadSignTransform(
        JSON.parse(res.result as string),
        account.signerType,
        true
      );
      return {
        result: JSON.stringify(signed),
      };
    });
  }
};

const MessageSigner = (
  options: SignerMessageOptions
): Promise<InternalOnMessageResponse> => {
  const { account, payload } = options;
  if (account.isHardware) {
    return Promise.reject({
      error: getCustomError("polkadot-hardware-wallets cant sign raw messages"),
    });
  } else {
    const bytes = isAscii(payload)
      ? u8aToBuffer(u8aUnwrapBytes(payload))
      : payload;
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [bufferToHex(u8aToBuffer(u8aWrapBytes(bytes))), account],
    }).then((res) => {
      if (res.error) return res;
      return {
        result: res.result,
      };
    });
  }
};

export { TransactionSigner, MessageSigner };
