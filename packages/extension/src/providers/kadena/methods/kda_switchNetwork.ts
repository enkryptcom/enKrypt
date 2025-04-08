import { getCustomError } from '@/libs/error';
import { sendToBackgroundFromBackground } from '@/libs/messenger/extension';
import { InternalMethods } from '@/types/messenger';
import { ProviderRPCRequest } from '@/types/provider';
import { MiddlewareFunction } from '@enkryptcom/types';
import DomainState from '@/libs/domain-state';

import KadenaProvider from '..';
import KDANetworks from '../networks';
import { KadenaNetworks } from '../types';
import { getNetworkInfo } from '../libs/network';
import { trackNetwork } from '@/libs/metrics';

const method: MiddlewareFunction = function (
  this: KadenaProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'kda_switchNetwork') return next();
  else {
    if (
      !payload.params ||
      payload.params.length < 1 ||
      !Object.values(KadenaNetworks).includes(payload.params[0])
    ) {
      return res(getCustomError('kda_switchNetwork: invalid params'));
    }

    const allNetworks = Object.values(KDANetworks);
    const validNetwork = allNetworks.find(
      net => net.name === payload.params![0],
    );

    if (validNetwork) {
      trackNetwork(NetworkChangeEvents.NetworkChangeAPI, {
        provider: validNetwork.provider,
        network: validNetwork.name,
      });
      sendToBackgroundFromBackground({
        message: JSON.stringify({
          method: InternalMethods.changeNetwork,
          params: [validNetwork.name],
        }),
        provider: validNetwork.provider,
        tabId: payload.options?.tabId,
      }).then(() => {
        const domainState = new DomainState();
        domainState
          .setSelectedNetwork(validNetwork.name)
          .then(() => res(null, getNetworkInfo(validNetwork.name)));
      });
    } else {
      return res(
        getCustomError(
          `kda_switchNetwork: provided network ${
            payload.params![0]
          } not supported`,
        ),
      );
    }
  }
};

export default method;
