import { InternalMethods, InternalOnMessageResponse } from "@/types/messenger";
import { SignerTransactionOptions } from "../types";
import { HWwalletType } from "@enkryptcom/types";
import HWwallet from "@enkryptcom/hw-wallets";
import { getCustomError } from "@/libs/error";
import sendUsingInternalMessengers from "@/libs/messenger/internal-messenger";
import { bufferToHex } from "@enkryptcom/utils";
import { blake2AsU8a } from "@polkadot/util-crypto";

const TransactionSigner = (
  options: SignerTransactionOptions
): Promise<InternalOnMessageResponse> => {
  const { account, network, payload } = options;
  if (account.isHardware) {
    const hwWallet = new HWwallet();
    return hwWallet
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
      .then((signature: any) => {
        return {
          result: signature,
        };
      })
      .catch((e: any) => {
        return Promise.reject({
          error: getCustomError(e.message),
        });
      });
  } else {
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [bufferToHex(blake2AsU8a(payload)), account],
    }).then((res) => {
      if (res.error) return res;
      return {
        result: JSON.parse(res.result?.replace("0x", "") as string),
      };
    });
  }
};

export { TransactionSigner };
