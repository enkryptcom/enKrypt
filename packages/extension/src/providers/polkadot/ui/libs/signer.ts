import { InternalMethods, InternalOnMessageResponse } from "@/types/messenger";
import { HWwalletType } from "@enkryptcom/types";
import HWwallet from "@enkryptcom/hw-wallets";
import { SignerOptions } from "../types";
import { getCustomError } from "@/libs/error";
import { payloadSignTransform, signPayload } from "../../libs/signing-utils";

const TransactionSigner = (
  options: SignerOptions
): Promise<InternalOnMessageResponse> => {
  const { account, network, sendToBackground, payload } = options;
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
      .catch((e: any) => ({ error: getCustomError(e) }));
  } else {
    const signMsg = signPayload(payload);
    return sendToBackground({
      method: InternalMethods.sign,
      params: [signMsg, account],
    }).then((res) => {
      if (res.error) {
        return res;
      } else {
        const signed = payloadSignTransform(
          res.result as string,
          account.signerType,
          true
        );
        return {
          result: JSON.stringify(signed),
        };
      }
    });
  }
};

export { TransactionSigner };
