import {
  ProviderMessage,
  MessageMethod,
  EmitEvent,
} from "@/providers/ethereum/types";
import {
  BitcoinProvider,
  handleIncomingMessage as handleIncomingMessageType,
} from "@/types/provider";
const handleIncomingMessage: handleIncomingMessageType = (
  provider,
  message
): void => {
  try {
    const _provider = provider as BitcoinProvider;
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
      const address = jsonMsg.params[0] as string;
      _provider.emit(EmitEvent.accountsChanged, [address]);
    } else {
      console.error(`Unable to process message:${message}`);
    }
  } catch (e) {
    console.error(e);
  }
};

export { handleIncomingMessage };
