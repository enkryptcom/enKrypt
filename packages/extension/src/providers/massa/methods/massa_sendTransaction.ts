import { MiddlewareFunction } from '@enkryptcom/types';
import { BackgroundProviderInterface, ProviderRPCRequest } from '@/types/provider';
import { getCustomError } from '@/libs/error';
import { WindowPromise } from '@/libs/window-promise';
import { getNetworkByName } from '@/libs/utils/networks';
import { NetworkNames } from '@enkryptcom/types';
import { JsonRpcProvider, Account, OperationOptions } from '@massalabs/massa-web3';

const method: MiddlewareFunction = async function (
  this: BackgroundProviderInterface,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'massa_sendTransaction') return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(
        getCustomError(
          'massa_sendTransaction: invalid request not enough params',
        ),
      );
    }

    const txParams = payload.params[0] as {
      from: string;
      to: string;
      amount: string;
      fee?: string;
    };

    if (!txParams.from || !txParams.to || !txParams.amount) {
      return res(
        getCustomError(
          'massa_sendTransaction: missing required parameters (from, to, amount)',
        ),
      );
    }

    try {
      // Get the account to sign the transaction

      const account = await this.KeyRing.getAccount(txParams.from)
      if (!account) {
        return res(
          getCustomError(
            'massa_sendTransaction: account not found',
          ),
        );
      }

      // Get network information
      const network = await getNetworkByName(NetworkNames.Massa);
      
      // Fetch the account balance
      const api = await network?.api();
      const balance = await api?.getBalance(account.address);
      
      // Create account object with balance information
      const accountWithBalance = {
        ...account,
        balance: balance, // Balance in base units
      };
      
      // Create transaction options
      const options: OperationOptions = {
        fee: txParams.fee ? BigInt(txParams.fee) : undefined,
      };

      // Create a window promise for user confirmation
      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.massaSendTransaction.path),
          JSON.stringify({
            ...payload,
            params: [txParams, accountWithBalance, network, options],
          }),
          true,
        )
        .then(async ({ error, result }) => {
          if (error) return res(error);
          res(null, result as string);
        })
        .catch((error) => {
          console.error('Error in massa_sendTransaction:', error);
          res(getCustomError('User rejected transaction'));
        });
    } catch (error) {
      console.error('Error in massa_sendTransaction:', error);
      res(getCustomError(`Transaction failed: ${error.message}`));
    }
  }
};

export default method; 