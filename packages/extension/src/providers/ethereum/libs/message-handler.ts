import { Provider } from "../inject";
import {
  ProviderMessage,
  MessageMethod,
  EmitEvent,
  ProviderConnectInfo,
} from "../types";
import {
  handleIncomingMessage as handleIncomingMessageType,
  handleOutgoingMessage as handleOutgoingMessageType,
} from "@/types/provider";
import { Response } from "@/types/messenger";
import { getError } from "./error-handler";

const handleIncomingMessage: handleIncomingMessageType = (
  provider: Provider,
  message: string
): void => {
  try {
    const jsonMsg = JSON.parse(message) as ProviderMessage;
    if (jsonMsg.method === MessageMethod.changeConnected) {
      const isConnected = jsonMsg.params[0] as boolean;
      provider.connected = isConnected;
      if (isConnected) {
        const connectionInfo: ProviderConnectInfo = {
          chainId: jsonMsg.params[1] as string,
        };
        if (provider.chainId !== connectionInfo.chainId) {
          provider.chainId = connectionInfo.chainId;
          provider.emit(EmitEvent.chainChanged, connectionInfo.chainId);
        }
        provider.emit(EmitEvent.connect, connectionInfo);
      } else {
        provider.emit(
          EmitEvent.disconnect,
          getError(jsonMsg.params[1] as number)
        );
      }
    } else if (jsonMsg.method === MessageMethod.changeChainId) {
      const chainId = jsonMsg.params[0] as string;
      if (provider.chainId !== chainId) {
        provider.chainId = chainId;
        provider.emit(EmitEvent.chainChanged, chainId);
      }
    } else if (jsonMsg.method === MessageMethod.changeAddress) {
      const address = jsonMsg.params[0] as string;
      if (provider.selectedAddress !== address) {
        provider.selectedAddress = address;
        provider.emit(EmitEvent.accountsChanged, [address]);
      }
    } else {
      console.error(`Unable to process message:${message}`);
    }
  } catch (e) {
    console.error(e);
  }
};
const handleOutgoingMessage: handleOutgoingMessageType = async (
  provider: Provider,
  message: string
): Promise<Response> => {
  return {
    result: "hello",
  };
};
export { handleIncomingMessage };
