import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendToBackgroundFromBackground = vi.fn(() => Promise.resolve(''));
const getResponse = vi.fn(() => Promise.resolve({ error: null, result: '""' }));
let rpcChainId = 1;

vi.mock('@/libs/messenger/extension', () => ({
  sendToBackgroundFromBackground: (...args: unknown[]) =>
    sendToBackgroundFromBackground(...(args as [])),
}));
vi.mock('@/libs/window-promise', () => ({
  WindowPromise: class {
    getResponse = (...args: unknown[]) => getResponse(...(args as []));
  },
}));
vi.mock('web3-eth', () => ({
  default: class {
    getChainId = () => Promise.resolve(rpcChainId);
  },
}));
vi.mock('@/libs/custom-networks-state', () => ({
  default: class {
    getAllCustomEVMNetworks = () => Promise.resolve([]);
  },
}));
vi.mock('@/libs/networks-state', () => ({
  default: class {
    setNetworkStatus = () => Promise.resolve();
  },
}));
vi.mock('@/libs/domain-state', () => ({
  default: class {
    getSelectedNetWork = () => Promise.resolve('SomeOtherNetwork');
    setSelectedNetwork = () => Promise.resolve();
  },
}));
vi.mock('@/libs/utils/networks', () => ({
  getAllNetworks: () =>
    Promise.resolve([{ name: 'Ethereum', chainID: '0x1' }]),
}));
vi.mock('@/libs/metrics', () => ({
  trackNetwork: () => {},
}));

import addEthereumChain from '../methods/wallet_addEthereumChain';

const fakeProvider = {
  getUIPath: (path: string) => path,
  UIRoutes: { walletAddEthereumChain: { path: 'add-network' } },
} as any;

const makePayload = (chainId: string, rpcUrl = 'http://127.0.0.1:8546') => ({
  method: 'wallet_addEthereumChain',
  params: [
    {
      chainId,
      chainName: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [rpcUrl],
    },
  ],
  options: { tabId: 1 },
});

describe('wallet_addEthereumChain chainId collision handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpcChainId = 1;
  });

  it('should switch to the existing network instead of adding a custom one when a non-canonical chainId collides with a built-in', async () => {
    const res = vi.fn();
    await addEthereumChain.call(
      fakeProvider,
      makePayload('0x01') as any,
      res,
      vi.fn(),
    );
    // No add-network approval popup
    expect(getResponse).not.toHaveBeenCalled();
    // Switched to the built-in network
    expect(sendToBackgroundFromBackground).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('"params":["Ethereum"]'),
      }),
    );
    expect(res).toHaveBeenCalledWith(null, null);
  });

  it('should switch to the existing network when the dapp chainId does not match but the RPC reports a built-in chainId', async () => {
    const res = vi.fn();
    await addEthereumChain.call(
      fakeProvider,
      makePayload('0x539') as any,
      res,
      vi.fn(),
    );
    expect(getResponse).not.toHaveBeenCalled();
    expect(res).toHaveBeenCalledWith(null, null);
  });

  it('should still prompt to add a genuinely new network', async () => {
    rpcChainId = 7777;
    const res = vi.fn();
    await addEthereumChain.call(
      fakeProvider,
      makePayload('0x1e61') as any,
      res,
      vi.fn(),
    );
    expect(getResponse).toHaveBeenCalledTimes(1);
    // The persisted options use the normalized RPC-reported chainId
    const optionsArg = JSON.parse(
      JSON.parse((getResponse.mock.calls[0] as unknown[])[1] as string)
        .params[0],
    );
    expect(optionsArg.chainID).to.be.eq('0x1e61');
  });
});
