import { InternalMethods, InternalOnMessageResponse } from "@/types/messenger";
import { SignerTransactionOptions, SignerMessageOptions } from "../types";
import { bufferToHex } from "ethereumjs-util";
import sendUsingInternalMessengers from "@/libs/messenger/internal-messenger";
import { hexToBuffer } from "@enkryptcom/utils";
import { Psbt } from "bitcoinjs-lib";
import { BitcoinNetwork, PaymentType } from "../../types/bitcoin-network";
import { EnkryptAccount } from "@enkryptcom/types";
import { signMessageOfBIP322Simple } from "../../libs/bip322-message-sign";
import { magicHash, toCompact } from "../../libs/sign-message-utils";

const PSBTSigner = (account: EnkryptAccount, network: BitcoinNetwork) => {
  return {
    publicKey: hexToBuffer(account.address),
    network: network.networkInfo,
    sign: (hash: Buffer): Promise<Buffer> => {
      return sendUsingInternalMessengers({
        method: InternalMethods.sign,
        params: [bufferToHex(hash), account],
      }).then((res) => {
        if (res.error) {
          return Promise.reject({
            error: res.error,
          });
        } else {
          return hexToBuffer(JSON.parse(res.result!)).subarray(0, 64);
        }
      });
    },
  };
};

const TransactionSigner = (
  options: SignerTransactionOptions
): Promise<Psbt> => {
  const { account, network, payload } = options;
  if (account.isHardware) {
    throw new Error("btc-hardware not implemented");
  } else {
    const tx = new Psbt({
      network: network.networkInfo,
      maximumFeeRate: network.networkInfo.maxFeeRate,
    });
    payload.inputs
      .map((u) => {
        const res: {
          hash: string;
          index: number;
          witnessUtxo?: { script: Buffer; value: number };
          nonWitnessUtxo?: Buffer;
        } = {
          hash: u.hash,
          index: u.index,
        };
        if (network.networkInfo.paymentType === PaymentType.P2WPKH) {
          res.witnessUtxo = {
            script: Buffer.from(u.witnessUtxo.script, "hex"),
            value: u.witnessUtxo.value,
          };
        } else if (network.networkInfo.paymentType === PaymentType.P2PKH) {
          res.nonWitnessUtxo = Buffer.from(u.raw, "hex");
        }
        return res;
      })
      .forEach((input) => tx.addInput(input));
    payload.outputs.forEach((output) => tx.addOutput(output));
    const signer = PSBTSigner(account, network);
    return tx.signAllInputsAsync(signer).then(() => {
      tx.finalizeAllInputs();
      return tx;
    });
  }
};

const MessageSigner = (
  options: SignerMessageOptions
): Promise<InternalOnMessageResponse> => {
  const { account, payload, network } = options;
  if (account.isHardware) {
    throw new Error("btc-hardware not implemented");
  } else {
    if (options.type === "bip322-simple") {
      const signer = PSBTSigner(account, network);
      return signMessageOfBIP322Simple({
        address: account.address,
        message: payload.toString(),
        network: network,
        Signer: signer,
      })
        .then((sig) => {
          return {
            result: JSON.stringify(sig),
          };
        })
        .catch((e) => {
          return {
            error: e.message,
          };
        });
    } else {
      const signer = {
        sign: (
          hash: Buffer
        ): Promise<{ signature: Buffer; recovery: number }> => {
          return sendUsingInternalMessengers({
            method: InternalMethods.sign,
            params: [bufferToHex(hash), account],
          }).then((res) => {
            if (res.error) {
              return Promise.reject({
                error: res.error,
              });
            } else {
              const sigBuffer = hexToBuffer(JSON.parse(res.result!));
              return {
                signature: sigBuffer.subarray(0, 64),
                recovery: sigBuffer[64],
              };
            }
          });
        },
      };
      const mHash = magicHash(payload);
      console.log(mHash.length);
      return signer.sign(mHash).then((sig) => {
        console.log(sig);
        return {
          result: JSON.stringify(
            toCompact(sig.recovery, sig.signature, true).toString("base64")
          ),
        };
      });
    }
  }
};

export { TransactionSigner, MessageSigner, PSBTSigner };
