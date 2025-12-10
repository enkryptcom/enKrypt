import {
  CallbackFunction,
  MiddlewareFunction,
  SignerType,
} from '@enkryptcom/types';
import { WindowPromise } from '@/libs/window-promise';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import DomainState from '@/libs/domain-state';
import { getCustomError } from '@/libs/error';
import { ProviderRPCRequest } from '@/types/provider';

import KadenaProvider from '..';
import AccountState from '../libs/accounts-state';
import { KadenaNetworks } from '../types';
import { getNetworkInfo } from '../libs/network';
import openOnboard from '@/libs/utils/open-onboard';
import { throttle } from 'lodash';

let isAccountAccessPending = false;
const throttledOpenOnboard = throttle(() => openOnboard(), 10000);

const pendingPromises: {
  payload: ProviderRPCRequest;
  res: CallbackFunction;
}[] = [];

const method: MiddlewareFunction = async function (
  this: KadenaProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'kda_requestAccounts') return next();
  else {
    const isInitialized = await this.KeyRing.isInitialized();
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

    const getAccounts = () => {
      const domainState = new DomainState();
      const publicKeyring = new PublicKeyRing();

      const selectedAddressPromise = domainState.getSelectedAddress();
      const selectedNetworkPromise = domainState.getSelectedNetWork();
      const accountsPromise = publicKeyring.getAccounts([
        SignerType.ed25519kda,
      ]);

      return Promise.all([
        selectedAddressPromise,
        selectedNetworkPromise,
        accountsPromise,
      ]).then(([selectedAddress, selectedNetwork, accounts]) => {
        const selectedNetworkName = Object.values(KadenaNetworks).find(
          n => n === selectedNetwork,
        );

        const account = accounts.find(acc => acc.address === selectedAddress);

        return {
          selectedNetwork: selectedNetworkName
            ? getNetworkInfo(selectedNetworkName)
            : null,
          selectedAccountAddress: this.network.displayAddress(
            account?.address || '',
          ),
          accounts: accounts.map(acc => {
            return {
              address: this.network.displayAddress(acc.address),
              publicKey: acc.publicKey.replace('0x', ''),
              genesisHash: '',
              name: acc.name,
              type: acc.signerType,
            };
          }),
        };
      });
    };

    const handleAccountAccess = (
      _payload: ProviderRPCRequest,
      _res: CallbackFunction,
    ) => {
      if (_payload.options && _payload.options.domain) {
        isAccountAccessPending = true;
        if (!isInitialized) {
          _res(getCustomError('Enkrypt not initialized'));
          throttledOpenOnboard();
          return handleRemainingPromises();
        }
        const accountsState = new AccountState();

        accountsState
          .isApproved(_payload.options.domain)
          .then(isApproved => {
            if (isApproved) {
              getAccounts()
                .then(acc => {
                  _res(null, acc);
                })
                .catch(err => {
                  throw err;
                });
            } else {
              const windowPromise = new WindowPromise();
              windowPromise
                .getResponse(
                  this.getUIPath(this.UIRoutes.kdaAccounts.path),
                  JSON.stringify(payload),
                )
                .then(({ error }) => {
                  if (error) {
                    throw error;
                  } else {
                    getAccounts()
                      .then(acc => {
                        _res(null, acc);
                      })
                      .catch(err => {
                        throw err;
                      });
                  }
                });
            }
          })
          .catch(err => {
            _res(err);
          })
          .finally(handleRemainingPromises);
      } else {
        _res(getCustomError('No domain set!'));
        handleRemainingPromises();
      }
    };

    handleAccountAccess(payload, res);
  }
};
export default method;
