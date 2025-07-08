import { MiddlewareFunction } from '@enkryptcom/types';
import { BackgroundProviderInterface, ProviderRPCRequest } from '@/types/provider';
import { CallbackFunction } from '@enkryptcom/types';
import { getCustomError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import openOnboard from '@/libs/utils/open-onboard';
import { SignerType } from '@enkryptcom/types';
import { NetworkNames } from '@enkryptcom/types';
import { getNetworkByName } from '@/libs/utils/networks';
import { MassaNetwork } from '../networks/mainnet';
import { getAccountsByNetworkName } from '@/libs/utils/accounts';
import { fromBase } from '@enkryptcom/utils';
import DomainState from '@/libs/domain-state';
import PublicKeyRing from '@/libs/keyring/public-keyring';

let isAccountAccessPending = false;
const pendingPromises: Array<{
  payload: ProviderRPCRequest;
  res: CallbackFunction;
}> = [];

const method: MiddlewareFunction = async function (
  this: BackgroundProviderInterface,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'massa_requestAccounts') return next();
  else {
    if (isAccountAccessPending) {
      pendingPromises.push({
        payload,
        res,
      });
      return;
    }
    isAccountAccessPending = true;
    const handleRemainingPromises = () => {
      isAccountAccessPending = false;
      if (pendingPromises.length) {
        const promi = pendingPromises.pop();
        if (promi) handleAccountAccess(promi.payload, promi.res);
      }
    };
    const handleAccountAccess = (
      _payload: ProviderRPCRequest,
      _res: CallbackFunction,
    ) => {
      if (_payload.options && _payload.options.domain) {
        isAccountAccessPending = true;
        const isInitialized = this.KeyRing.isInitialized();
        if (!isInitialized) {
          _res(getCustomError('Enkrypt not initialized'));
          openOnboard();
          return handleRemainingPromises();
        }
        const domainState = new DomainState();
        const publicKeyring = new PublicKeyRing();

        const selectedAddressPromise = domainState.getSelectedAddress();
        const selectedNetworkPromise = domainState.getSelectedNetWork();
        const accountsPromise = publicKeyring.getAccounts([SignerType.ed25519]);

        Promise.all([
          selectedAddressPromise,
          selectedNetworkPromise,
          accountsPromise,
        ]).then(([selectedAddress, selectedNetwork, accounts]) => {
          const selectedNetworkName = Object.values(NetworkNames).find(
            n => n === selectedNetwork,
          );

          const account = accounts.find(acc => acc.address === selectedAddress);

          const network = getNetworkByName(selectedNetworkName || NetworkNames.Massa) as MassaNetwork;

          return {
            selectedNetwork: network,
            selectedAccountAddress: network.displayAddress(
              account?.address || '',
            ),
            accounts: accounts.map(acc => {
              return {
                address: network.displayAddress(acc.address),
                publicKey: acc.publicKey,
                name: acc.name,
                type: acc.signerType,
              };
            }),
          };
        }).then(async (accountData) => {
          const api = await accountData.selectedNetwork.api();
          const balance = await api.getBalance(accountData.selectedAccountAddress);
          
          const massaAccount = {
            address: accountData.selectedAccountAddress,
            balance: fromBase(balance, accountData.selectedNetwork.decimals),
            activeRolls: 0, // TODO: Implement rolls fetching
            candidateRolls: 0, // TODO: Implement rolls fetching
          };

          _res(null, [massaAccount]);
          handleRemainingPromises();
        }).catch((error) => {
          console.error('Error in massa_requestAccounts:', error);
          _res(getCustomError(ErrorCodes.userRejected));
          handleRemainingPromises();
        });
      } else {
        _res(getCustomError(ErrorCodes.userRejected));
        handleRemainingPromises();
      }
    };
    handleAccountAccess(payload, res);
  }
};

export default method; 