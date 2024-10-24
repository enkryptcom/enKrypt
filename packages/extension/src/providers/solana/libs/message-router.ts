import {
  ProviderMessage,
  MessageMethod,
  EmitEvent,
} from '@/providers/ethereum/types';
import {
  SolanaProvider,
  handleIncomingMessage as handleIncomingMessageType,
} from '@/types/provider';
const handleIncomingMessage: handleIncomingMessageType = (
  provider,
  message,
): void => {
  try {
    const _provider = provider as SolanaProvider;
    const jsonMsg = JSON.parse(message) as ProviderMessage;
    if (jsonMsg.method === MessageMethod.changeConnected) {
      const isConnected = jsonMsg.params[0] as boolean;
      _provider.connected = isConnected;
      if (isConnected) {
        _provider.emit(EmitEvent.connect);
      } else {
        _provider.emit(EmitEvent.disconnect);
      }
    } else if (jsonMsg.method === MessageMethod.changeAddress) {
      _provider
        .request({
          method: 'sol_connect',
          params: [],
        })
        .then((res: { address: string; pubkey: string }[]) => {
          _provider.accounts = res;
          _provider.emit(EmitEvent.accountsChanged);
        });
    }
  } catch (e) {
    console.error(e);
  }
};

export { handleIncomingMessage };
