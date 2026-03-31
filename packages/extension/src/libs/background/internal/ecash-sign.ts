import { getCustomError } from '@/libs/error';
import KeyRingBase from '@/libs/keyring/keyring';
import { InternalOnMessageResponse } from '@/types/messenger';
import {
  EnkryptAccount,
  RPCRequestType,
  HWwalletType,
  NetworkNames,
} from '@enkryptcom/types';
import { ChronikClient } from 'chronik-client';
import { Wallet } from 'ecash-wallet';
import { getNetworkByName } from '@/libs/utils/networks';
import { isValidECashAddress } from '@/providers/ecash/libs/utils';

interface ECashSignParams {
  toAddress: string;
  amount: string;
  account: EnkryptAccount;
  networkName: NetworkNames;
}

const ecashSign = async (
  keyring: KeyRingBase,
  message: RPCRequestType,
): Promise<InternalOnMessageResponse> => {
  if (!message.params || message.params.length < 1) {
    return { error: getCustomError('ecash-sign: invalid params') };
  }

  const params = message.params[0] as ECashSignParams;

  if (
    !params.toAddress ||
    !params.amount ||
    !params.account ||
    !params.networkName
  ) {
    return { error: getCustomError('ecash-sign: missing required parameters') };
  }

  if (keyring.isLocked()) {
    return { error: getCustomError('ecash-sign: keyring is locked') };
  }

  if (
    params.account.isHardware ||
    Object.values(HWwalletType).includes(
      params.account.walletType as unknown as HWwalletType,
    )
  ) {
    return {
      error: getCustomError('ecash-sign: hardware wallets not yet supported'),
    };
  }

  let privateKeyBuffer: Buffer | null = null;
  let pkBytes: Uint8Array | null = null;

  try {
    const network = await getNetworkByName(params.networkName);
    if (!network) {
      return { error: getCustomError('ecash-sign: unknown network') };
    }

    const cashAddrPrefix = (network as any).cashAddrPrefix ?? 'ecash';
    if (!isValidECashAddress(params.toAddress, cashAddrPrefix)) {
      return {
        error: getCustomError('ecash-sign: invalid destination address'),
      };
    }

    privateKeyBuffer = await keyring.getPrivateKeyForECash(params.account);
    pkBytes = new Uint8Array(privateKeyBuffer);
    const chronik = new ChronikClient([network.node]);
    const wallet = Wallet.fromSk(pkBytes, chronik);
    await wallet.sync();

    const amountBigInt = BigInt(params.amount);

    const balance = wallet
      .spendableSatsOnlyUtxos()
      .reduce((total, utxo) => total + utxo.sats, 0n);

    if (amountBigInt > balance) {
      throw new Error(
        `Insufficient balance: ${balance} sats available, ${amountBigInt} sats requested`,
      );
    }

    const action = wallet.action({
      outputs: [{ address: params.toAddress, sats: amountBigInt }],
    });
    const built = action.build();
    const result = await built.broadcast();

    if (!result.success) {
      throw new Error(
        result.errors?.length ? result.errors.join(', ') : 'Broadcast failed',
      );
    }
    const txid = result.broadcasted[0];
    if (!txid) {
      throw new Error('Broadcast succeeded but no txid returned');
    }
    return { result: JSON.stringify({ txid }) };
  } catch (e: any) {
    console.error('[ecash-sign] Error:', e);
    return {
      error: getCustomError(e.message || 'eCash transaction signing failed'),
    };
  } finally {
    if (privateKeyBuffer) privateKeyBuffer.fill(0);
    if (pkBytes) pkBytes.fill(0);
  }
};

export default ecashSign;
