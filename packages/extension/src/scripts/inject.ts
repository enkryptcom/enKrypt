import {
  setWindowNamespace,
  windowOnMessage,
  providerSendMessage,
} from "@/libs/messenger/window";
import { MessageType } from "@/types/messenger";
import { ProviderName, ProviderType } from "@/types/provider";
import EthereumProvider from "@/providers/ethereum/inject";
import PolkadotProvider from "@/providers/polkadot/inject";
setWindowNamespace();
window.enkrypt = {
  providers: {},
};

windowOnMessage(MessageType.REQUEST, async (msg): Promise<void> => {
  window["enkrypt"]["providers"][msg.provider].handleMessage(msg.message);
});

console.log("hello from injected code");

PolkadotProvider(window, {
  name: ProviderName.polkadot,
  type: ProviderType.substrate,
  sendMessageHandler: providerSendMessage,
});
EthereumProvider(window, {
  name: ProviderName.ethereum,
  type: ProviderType.evm,
  sendMessageHandler: providerSendMessage,
});
