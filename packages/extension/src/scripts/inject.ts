import {
  setWindowNamespace,
  sendToBackgroundFromWindow,
  windowOnMessage,
} from "@/libs/messenger/window";
import { MessageType, Provider, Response } from "@/types/messenger";
import EthereumProvider from "@/providers/ethereum/inject";
setWindowNamespace();

sendToBackgroundFromWindow(MessageType.REQUEST, {
  provider: Provider.enkrypt,
  message: "injected",
}).then(console.log);

windowOnMessage(MessageType.REQUEST, async (msg): Promise<Response | void> => {
  // console.log(msg);
  window[msg.provider].handleMessage(msg.message);
});

console.log("hello from injected code");
window.enkrypt = "hello";
window[EthereumProvider.name] = new EthereumProvider.provider();
window.ethereum.on("connect", console.log);
