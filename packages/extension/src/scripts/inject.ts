import {
  setWindowNamespace,
  windowOnMessage,
  providerSendMessage,
} from "@/libs/messenger/window";
import { ProviderName, ProviderType } from "@/types/provider";
import EthereumProvider from "@/providers/ethereum/inject";
import PolkadotProvider from "@/providers/polkadot/inject";
import { InternalMethods } from "@/types/messenger";
setWindowNamespace();
window.enkrypt = {
  providers: {},
};

windowOnMessage(async (msg): Promise<void> => {
  window["enkrypt"]["providers"][msg.provider].handleMessage(msg.message);
});
window.addEventListener("load", () => {
  providerSendMessage(
    ProviderName.enkrypt,
    JSON.stringify({ method: InternalMethods.newWindowInit })
  );
});
window.addEventListener("beforeunload", () => {
  providerSendMessage(
    ProviderName.enkrypt,
    JSON.stringify({ method: InternalMethods.newWindowUnload })
  );
});
console.info("hello from injected code");
EthereumProvider(window, {
  name: ProviderName.ethereum,
  type: ProviderType.evm,
  sendMessageHandler: providerSendMessage,
});
PolkadotProvider(window, {
  name: ProviderName.polkadot,
  type: ProviderType.substrate,
  sendMessageHandler: providerSendMessage,
});
