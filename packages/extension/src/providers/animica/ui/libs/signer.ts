import { InternalMethods } from '@/types/messenger';
import { bufferToHex, hexToBuffer } from '@enkryptcom/utils';
import sendUsingInternalMessengers from '@/libs/messenger/internal-messenger';
import { EnkryptAccount } from '@enkryptcom/types';
import { AnimicaNetwork } from '../../networks/animica-base';
import {
  TX_SALT_LENGTH,
  buildTransferBody,
  computeSignHash,
  computeTxId,
  encodeSignedTransaction,
} from '../../libs/transaction';

export interface AnimicaTransactionOptions {
  account: EnkryptAccount;
  network: AnimicaNetwork;
  payload: {
    to: string;
    /** nANM */
    amount: string;
    /** nANM per gas unit */
    gasPrice: string;
    gasLimit: number;
    validAfter: number;
    validUntil: number;
  };
}

export interface AnimicaSignedTransaction {
  /** 0x-prefixed canonical CBOR envelope, ready for `tx.sendRawTransaction`. */
  rawTx: string;
  txHash: string;
  signature: string;
  publicKey: string;
}

/**
 * Sign an Animica transfer: build the v2 body, derive the sign-hash and have
 * the keyring produce the ML-DSA-65 signature over it.
 */
export const AnimicaTransactionSigner = (
  options: AnimicaTransactionOptions,
): Promise<AnimicaSignedTransaction> => {
  const { account, network, payload } = options;

  const body = buildTransferBody(network.chainId, {
    from: account.address,
    to: payload.to,
    amount: BigInt(payload.amount),
    gasPrice: BigInt(payload.gasPrice),
    gasLimit: payload.gasLimit,
    validAfter: payload.validAfter,
    validUntil: payload.validUntil,
    salt: crypto.getRandomValues(new Uint8Array(TX_SALT_LENGTH)),
  });
  const signHash = computeSignHash(body, {
    chainId: network.chainId,
    genesisHash: network.genesisHash,
    forkId: network.forkId,
  });

  return sendUsingInternalMessengers({
    method: InternalMethods.sign,
    params: [bufferToHex(signHash), account],
  }).then(res => {
    if (res.error) {
      return Promise.reject(res);
    } else {
      const signature: string = JSON.parse(res.result as string) || '';
      const rawTx = encodeSignedTransaction(
        body,
        hexToBuffer(account.publicKey),
        hexToBuffer(signature),
      );

      return {
        rawTx: bufferToHex(rawTx),
        txHash: computeTxId(rawTx),
        signature,
        publicKey: account.publicKey,
      };
    }
  });
};
