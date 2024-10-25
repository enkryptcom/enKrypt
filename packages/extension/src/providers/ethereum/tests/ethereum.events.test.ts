import { describe, it, expect } from 'vitest';
import { ProviderName, ProviderType, EthereumProvider } from '@/types/provider';
import EthereumInject from '../inject';
import { MessageMethod, EmitEvent } from '../types';
import { OnMessageResponse } from '@enkryptcom/types';
import { EnkryptWindow } from '@/types/globals';
import { InternalMethods } from '@/types/messenger';

const defaultSettings = {
  evm: {
    inject: {
      disabled: false,
      timestamp: 0,
    },
  },
  substrate: {
    injectPolkadotjs: false,
  },
  btc: {
    injectUnisat: false,
  },
  enkrypt: {
    installedTimestamp: 0,
    randomUserID: '',
    isMetricsEnabled: true,
  },
  manifestVersion: 3,
};
const providerSendMessage = async (
  provider: ProviderName,
  message: string,
): Promise<OnMessageResponse> => {
  if (JSON.parse(message).method === InternalMethods.getSettings) {
    return defaultSettings as unknown as OnMessageResponse;
  }
  return {
    result: `dummy-response-${provider}-${message}`,
  };
};

const options = {
  name: ProviderName.ethereum,
  type: ProviderType.evm,
  sendMessageHandler: providerSendMessage,
};
const tempWindow: EnkryptWindow = {
  enkrypt: {
    providers: {},
    settings: defaultSettings,
  },

  addEventListener: () => {},

  CustomEvent: class {},

  dispatchEvent: () => {},
};
describe('Test injected Ethereum', () => {
  it('should have default values', async () => {
    EthereumInject(tempWindow, options);
    await new Promise(r => setTimeout(r, 500));
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
    expect(provider.name).to.equal(ProviderName.ethereum);
    expect(provider.chainId).to.equal(null);
    expect(provider.isEnkrypt).to.equal(true);
  });
});

describe('Test emitted events', () => {
  it('should emit chainChanged', async () => {
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
    const chainId = '0x5';
    let res: (value: unknown) => void;
    const promise = new Promise<unknown>(function (_res) {
      res = _res;
    });
    provider.on(EmitEvent.chainChanged, __chainId => {
      res(__chainId);
    });
    provider.handleMessage(
      JSON.stringify({
        method: MessageMethod.changeChainId,
        params: ['0x5'],
      }),
    );
    const _chainId = await promise;
    expect(provider.chainId).to.equal(chainId);
    expect(_chainId).to.equal(chainId);
  });
  it('should emit accountsChanged', async () => {
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
    const address = '0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D';
    const promise = new Promise<unknown>(function (res) {
      provider.on(EmitEvent.accountsChanged, _addresses => {
        res(_addresses);
      });
    });
    provider.handleMessage(
      JSON.stringify({
        method: MessageMethod.changeAddress,
        params: [address],
      }),
    );
    const addresses = await promise;
    expect(addresses).deep.equal([address]);
    expect(provider.selectedAddress).to.deep.equal(address);
  });
  it('should emit connect', async () => {
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
    const chainId = '0x5';
    const promise = new Promise(function (res) {
      provider.on(EmitEvent.connect, _connectionInfo => {
        res(_connectionInfo);
      });
    });
    provider.handleMessage(
      JSON.stringify({
        method: MessageMethod.changeConnected,
        params: [true, chainId],
      }),
    );
    const connectionInfo = await promise;
    expect(connectionInfo).deep.equal({
      chainId,
    });
    expect(provider.chainId).to.equal(chainId);
  });
  it('should emit disconnect', async () => {
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
    const disconnectCode = 4901;
    const promise = new Promise(function (res) {
      provider.on(EmitEvent.disconnect, _connectionInfo => {
        res(_connectionInfo);
      });
    });
    provider.handleMessage(
      JSON.stringify({
        method: MessageMethod.changeConnected,
        params: [false, disconnectCode],
      }),
    );
    const connectionInfo = await promise;
    expect(connectionInfo).deep.equal({
      code: 4901,
      message:
        'Chain Disconnected: The Provider is not connected to the requested chain.',
    });
    expect(provider.isConnected()).to.equal(false);
  });
});
