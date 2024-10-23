import { InternalMethods, InternalOnMessageResponse } from '@/types/messenger';
import { SignerTransactionOptions, SignerMessageOptions } from '../types';
import sendUsingInternalMessengers from '@/libs/messenger/internal-messenger';
import { hexToBuffer, bufferToHex } from '@enkryptcom/utils';
import { Psbt, Transaction } from 'bitcoinjs-lib';
import { BitcoinNetwork, PaymentType } from '../../types/bitcoin-network';
import { EnkryptAccount, HWwalletType } from '@enkryptcom/types';
import {
  getPSBTMessageOfBIP322Simple,
  getSignatureFromSignedTransaction,
  signMessageOfBIP322Simple,
} from '../../libs/bip322-message-sign';
import { magicHash, toCompact } from '../../libs/sign-message-utils';
import HWwallet from '@enkryptcom/hw-wallets';
import type BitcoinAPI from '@/providers/bitcoin/libs/api';

const PSBTSigner = (account: EnkryptAccount, network: BitcoinNetwork) => {
  return {
    publicKey: hexToBuffer(account.address),
    network: network.networkInfo,
    sign: (hash: Buffer): Promise<Buffer> => {
      return sendUsingInternalMessengers({
        method: InternalMethods.sign,
        params: [bufferToHex(hash), account],
      }).then(res => {
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

const TransactionSigner = async (
  options: SignerTransactionOptions,
): Promise<Transaction> => {
  const { account, network, payload } = options;
  const tx = new Psbt({
    network: network.networkInfo,
    maximumFeeRate: network.networkInfo.maxFeeRate,
  });
  payload.inputs
    .map(u => {
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
          script: Buffer.from(u.witnessUtxo.script, 'hex'),
          value: u.witnessUtxo.value,
        };
      } else if (network.networkInfo.paymentType === PaymentType.P2PKH) {
        res.nonWitnessUtxo = Buffer.from(u.raw, 'hex');
      }
      return res;
    })
    .forEach(input => tx.addInput(input));
  payload.outputs.forEach(output => tx.addOutput(output));
  if (account.isHardware) {
    const hwwallets = new HWwallet();
    const api = (await network.api()) as BitcoinAPI;
    const txPromises = payload.inputs.map(u => api.getRawTransaction(u.hash));
    const rawTxs = await Promise.all(txPromises);
    for (const t of rawTxs) {
      if (t === null) throw new Error('bitcoin-signer: Invalid tx hash');
    }
    return hwwallets
      .signTransaction({
        transaction: {
          rawTxs: rawTxs as string[],
          psbtTx: tx,
        },
        networkName: network.name,
        pathIndex: account.pathIndex.toString(),
        pathType: {
          basePath: account.basePath,
          path: account.HWOptions!.pathTemplate,
        },
        wallet: account.walletType as unknown as HWwalletType,
      })
      .then((strTx: string) => {
        return Transaction.fromHex(strTx);
      });
  } else {
    const signer = PSBTSigner(account, network);
    return tx.signAllInputsAsync(signer).then(() => {
      tx.finalizeAllInputs();
      return tx.extractTransaction();
    });
  }
};

const MessageSigner = (
  options: SignerMessageOptions,
): Promise<InternalOnMessageResponse> => {
  const { account, payload, network } = options;
  if (account.isHardware) {
    const psbtToSign = getPSBTMessageOfBIP322Simple({
      address: account.address,
      message: payload.toString(),
      network: network,
    });
    const hwwallets = new HWwallet();
    return hwwallets
      .signPersonalMessage({
        message: payload,
        type: options.type as any,
        psbtTx: psbtToSign.psbtToSign,
        inputTx: psbtToSign.txdata,
        networkName: network.name,
        pathIndex: account.pathIndex.toString(),
        pathType: {
          basePath: account.basePath,
          path: account.HWOptions!.pathTemplate,
        },
        wallet: account.walletType as unknown as HWwalletType,
      })
      .then((strTx: string) => {
        const sig = getSignatureFromSignedTransaction(strTx);
        return {
          result: JSON.stringify(sig),
        };
      })
      .catch((e: any) => {
        return {
          error: {
            message: e.message,
            code: -1,
          },
        };
      });
  } else {
    if (options.type === 'bip322-simple') {
      const signer = PSBTSigner(account, network);
      return signMessageOfBIP322Simple({
        address: account.address,
        message: payload.toString(),
        network: network,
        Signer: signer,
      })
        .then(sig => {
          return {
            result: JSON.stringify(sig),
          };
        })
        .catch(e => {
          return {
            error: {
              message: e.message,
              code: -1,
            },
          };
        });
    } else {
      const signer = {
        sign: (
          hash: Buffer,
        ): Promise<{ signature: Buffer; recovery: number }> => {
          return sendUsingInternalMessengers({
            method: InternalMethods.sign,
            params: [bufferToHex(hash), account],
          }).then(res => {
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
      return signer.sign(mHash).then(sig => {
        return {
          result: JSON.stringify(
            toCompact(sig.recovery, sig.signature, true).toString('base64'),
          ),
        };
      });
    }
  }
};

export { TransactionSigner, MessageSigner, PSBTSigner };
