import {
  setWindowNamespace,
  sendToBackgroundFromWindow,
  windowOnMessage,
} from "@/libs/messenger/window";
import { MessageType, Provider, Response } from "@/types/messenger";
import EthereumProvider from "@/providers/ethereum/inject";
setWindowNamespace();

sendToBackgroundFromWindow(MessageType.REQUEST, {
  provider: Provider.ethereum,
  message: "hello from window",
}).then(console.log);

windowOnMessage(MessageType.REQUEST, async (msg): Promise<Response> => {
  console.log(msg);
  return {
    result: "hello response from window",
  };
});

console.log("hello from injected code");
window.enkrypt = "hello";
window[EthereumProvider.name] = new EthereumProvider.provider();
