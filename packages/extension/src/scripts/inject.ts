import {
  setWindowNamespace,
  sendToBackgroundFromWindow,
  windowOnMessage,
  providerSendMessage,
} from "@/libs/messenger/window";
import { MessageType, Response } from "@/types/messenger";
import { ProviderName, ProviderType } from "@/types/provider";
import EthereumProvider from "@/providers/ethereum/inject";
setWindowNamespace();
window.enkrypt = {
  providers: {},
};
// sendToBackgroundFromWindow(MessageType.REQUEST, {
//   provider: ProviderName.enkrypt,
//   message: "injected",
// }).then(console.log);

windowOnMessage(MessageType.REQUEST, async (msg): Promise<Response | void> => {
  window[msg.provider].handleMessage(msg.message);
});

console.log("hello from injected code");

EthereumProvider(window, {
  name: ProviderName.ethereum,
  type: ProviderType.evm,
  sendMessageHandler: providerSendMessage,
});
