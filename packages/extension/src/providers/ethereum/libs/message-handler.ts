import {
  ProviderMessage,
  MessageMethod,
  EmitEvent,
  ProviderConnectInfo,
} from "../types";
import {
  EnkryptProviderEventMethods,
  EthereumProvider,
  handleIncomingMessage as handleIncomingMessageType,
} from "@/types/provider";
import { getError } from "../../../libs/error";
import { RPCRequestType } from "@enkryptcom/types";
const subscriptionMap: Record<string, any> = {};
const handleIncomingMessage: handleIncomingMessageType = (
  provider,
  message
): void => {
  try {
    const _provider = provider as EthereumProvider;
    const jsonMsg = JSON.parse(message) as ProviderMessage;
    if (jsonMsg.method === MessageMethod.changeConnected) {
      const isConnected = jsonMsg.params[0] as boolean;
      _provider.connected = isConnected;
      if (isConnected) {
        const connectionInfo: ProviderConnectInfo = {
          chainId: jsonMsg.params[1] as string,
        };
        if (_provider.chainId !== connectionInfo.chainId) {
          _provider.chainId = connectionInfo.chainId;
          _provider.emit(EmitEvent.chainChanged, connectionInfo.chainId);
        }
        _provider.emit(EmitEvent.connect, connectionInfo);
      } else {
        _provider.emit(
          EmitEvent.disconnect,
          getError(jsonMsg.params[1] as number)
        );
      }
    } else if (jsonMsg.method === MessageMethod.changeChainId) {
      const chainId = jsonMsg.params[0] as string;
      if (_provider.chainId !== chainId) {
        _provider.chainId = chainId;
        _provider.emit(EmitEvent.chainChanged, chainId);
      }
    } else if (jsonMsg.method === MessageMethod.changeAddress) {
      const address = jsonMsg.params[0] as string;
      if (_provider.selectedAddress !== address) {
        _provider.selectedAddress = address;
        _provider.emit(EmitEvent.accountsChanged, [address]);
      }
    } else if (jsonMsg.method === MessageMethod.subscription) {
      const params = jsonMsg.params as Record<string, any>;
      if (subscriptionMap[params.subscription]) {
        params.subscription = subscriptionMap[params.subscription];
      }
      _provider.emit(EmitEvent.message, {
        data: params,
        type: jsonMsg.method,
      });
    } else if (
      jsonMsg.method === EnkryptProviderEventMethods.persistentEvents
    ) {
      const initialEvent = jsonMsg.params[0] as RPCRequestType;
      if (initialEvent.method === "eth_subscribe") {
        const initialRes = jsonMsg.params[1];
        const newRes = jsonMsg.params[2];
        subscriptionMap[JSON.parse(newRes)] = JSON.parse(initialRes);
      } else {
        console.error(`Unable to process persistentEvent:${message}`);
      }
    } else {
      console.error(`Unable to process message:${message}`);
    }
  } catch (e) {
    console.error(e);
  }
};

export { handleIncomingMessage };
