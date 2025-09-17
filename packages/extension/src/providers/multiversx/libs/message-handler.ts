import {
  EmitEvent,
  MessageMethod,
  ProviderMessage,
} from '@/providers/multiversx/types';

import { handleIncomingMessage as handleIncomingMessageType } from '@/types/provider';
import MultiversXProvider from '..';

const handleIncomingMessage: handleIncomingMessageType = (
  provider,
  message,
): void => {
  try {
    const _provider = provider as unknown as MultiversXProvider;
    const jsonMsg = JSON.parse(message) as ProviderMessage;

    if (jsonMsg.method === MessageMethod.changeAddress) {
      const address = jsonMsg.params[0] as string;
      _provider.emit(EmitEvent.accountsChanged, [address]);
    } else {
      console.error(`Unable to process message: ${message}`);
    }
  } catch (e) {
    console.error(e);
  }
};

export { handleIncomingMessage };
