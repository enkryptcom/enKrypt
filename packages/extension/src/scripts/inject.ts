import {
  providerSendMessage,
  setWindowNamespace,
  windowOnMessage,
} from '@/libs/messenger/window';
import BitcoinProvider from '@/providers/bitcoin/inject';
import EthereumProvider from '@/providers/ethereum/inject';
import KadenaProvider from '@/providers/kadena/inject';
import MultiversXProvider from '@/providers/multiversx/inject';
import PolkadotProvider from '@/providers/polkadot/inject';
import SolanaProvider from '@/providers/solana/inject';
import { ProviderName, ProviderType } from '@/types/provider';

import { InternalMethods } from '@/types/messenger';

setWindowNamespace();
(window as Window).enkrypt = {
  providers: {},
  settings: {},
};
const loadInjectedProviders = () => {
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
  BitcoinProvider(window, {
    name: ProviderName.bitcoin,
    type: ProviderType.bitcoin,
    sendMessageHandler: providerSendMessage,
  });
  KadenaProvider(window, {
    name: ProviderName.kadena,
    type: ProviderType.kadena,
    sendMessageHandler: providerSendMessage,
  });
  SolanaProvider(window, {
    name: ProviderName.solana,
    type: ProviderType.solana,
    sendMessageHandler: providerSendMessage,
  });
  MultiversXProvider(window, {
    name: ProviderName.multiversx,
    type: ProviderType.multiversx,
    sendMessageHandler: providerSendMessage,
  });
};

loadInjectedProviders();

windowOnMessage(async (msg): Promise<void> => {
  window['enkrypt']['providers'][msg.provider].handleMessage(msg.message);
});
window.addEventListener('load', () => {
  providerSendMessage(
    ProviderName.enkrypt,
    JSON.stringify({ method: InternalMethods.newWindowInit }),
  );
});
window.addEventListener('beforeunload', () => {
  providerSendMessage(
    ProviderName.enkrypt,
    JSON.stringify({ method: InternalMethods.newWindowUnload }),
  );
});
console.info('Enkrypt: Hello from IN');
