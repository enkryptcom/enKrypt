import {
  ProviderMessage,
  MessageMethod,
  EmitEvent,
} from '@/providers/kadena/types';

import {
  KadenaProvider,
  handleIncomingMessage as handleIncomingMessageType,
} from '@/types/provider';

const handleIncomingMessage: handleIncomingMessageType = (
  provider,
  message,
): void => {
  try {
    const _provider = provider as KadenaProvider;
    const jsonMsg = JSON.parse(message) as ProviderMessage;

    if (jsonMsg.method === MessageMethod.changeAddress) {
      const address = jsonMsg.params[0] as string;
      _provider.emit(EmitEvent.accountsChanged, [address]);
    } else if (jsonMsg.method === MessageMethod.changeNetwork) {
      const networkId = jsonMsg.params[0] as string;
      _provider.emit(EmitEvent.networkChanged, [networkId]);
    } else {
      console.error(`Unable to process message: ${message}`);
    }
  } catch (e) {
    console.error(e);
  }
};

export { handleIncomingMessage };
