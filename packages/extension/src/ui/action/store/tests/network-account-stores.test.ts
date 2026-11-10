import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { EnkryptAccount } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import { InternalMethods } from '@/types/messenger';
import { EnkryptProviderEventMethods } from '@/types/provider';
import { MessageMethod } from '@/providers/ethereum/types';
import { MessageMethod as KadenaMessageMethod } from '@/providers/kadena/types';
import { useNetworksStore } from '../networks-store';
import { useAccountsStore } from '../accounts-store';

/**
 * Everything the stores reach outside themselves for: the persisted domain
 * state, the keyring, the networks and the messenger. Declared with vi.hoisted
 * because the vi.mock factories below run before the imports above.
 */
const mocks = vi.hoisted(() => {
  /** Balance lookups wait for `until`, so a test can hold them back */
  const balances = { until: Promise.resolve() };
  /** Writes of the selected network wait for `until` in the same way */
  const networkSaves = { until: Promise.resolve() };
  const account = (name: string, address: string) => ({
    name,
    address,
    isHardware: false,
  });
  const network = (
    name: string,
    provider: string,
    extra: Record<string, unknown> = {},
  ) => ({
    name,
    provider,
    signer: [],
    decimals: 18,
    displayAddress: (address: string) => address,
    api: async () => ({
      getBalance: async () => {
        await balances.until;
        return '2000000000000000000';
      },
    }),
    ...extra,
  });
  const addApprovedAddress = vi.fn();
  return {
    balances,
    networkSaves,
    /** What DomainState has saved for the current domain */
    saved: {
      network: null as string | null,
      subNetwork: null as string | null,
      address: null as string | null,
    },
    networks: {
      ETH: network('ETH', 'ethereum', { chainID: '0x1' }),
      MATIC: network('MATIC', 'ethereum', { chainID: '0x89' }),
      BTC: network('BTC', 'bitcoin'),
      KDA: network('KDA', 'kadena', {
        subNetworks: [
          { id: '0', name: 'Chain 0' },
          { id: '1', name: 'Chain 1' },
        ],
      }),
    } as Record<string, any>,
    accounts: {
      ETH: [account('Eth 1', '0xaaa'), account('Eth 2', '0xbbb')],
      MATIC: [account('Eth 1', '0xaaa'), account('Eth 2', '0xbbb')],
      BTC: [account('Btc 1', 'bc1aaa')],
      KDA: [account('Kda 1', 'k:aaa')],
    } as Record<string, any[]>,
    /** Per network name: a promise the account lookup waits for */
    accountsDelay: {} as Record<string, Promise<void>>,
    restrictedAddresses: [] as string[],
    sendToBackgroundFromAction: vi.fn<
      (message: unknown) => Promise<{ result: string }>
    >(async () => ({ result: 'true' })),
    addApprovedAddress,
    /** Stands in for a provider's accounts-state module */
    accountState: () => ({
      default: class {
        addApprovedAddress = addApprovedAddress;
      },
    }),
  };
});

vi.mock('@/libs/domain-state', () => ({
  default: class {
    getSelectedNetWork = async () => mocks.saved.network;
    setSelectedNetwork = async (name: string) => {
      await mocks.networkSaves.until;
      mocks.saved.network = name;
    };
    getSelectedSubNetWork = async () => mocks.saved.subNetwork;
    setSelectedSubNetwork = async (id: string) => {
      mocks.saved.subNetwork = id;
    };
    getSelectedAddress = async () => mocks.saved.address;
    setSelectedAddress = async (address: string) => {
      mocks.saved.address = address;
    };
    getCurrentTabId = async () => 7;
    getCurrentDomain = async () => 'example.com';
  },
}));
vi.mock('@/libs/networks-state', () => ({
  default: class {
    getPinnedNetworkNames = async () => [];
    getEnabledTestNetworks = async () => [];
  },
}));
vi.mock('@/libs/utils/networks', () => ({
  DEFAULT_EVM_NETWORK: mocks.networks.ETH,
  getAllNetworks: async () => Object.values(mocks.networks),
  getNetworkByName: async (name: string) => mocks.networks[name],
}));
vi.mock('@/libs/utils/accounts', () => ({
  getAccountsByNetworkName: async (name: string) => {
    await mocks.accountsDelay[name];
    return mocks.accounts[name] ?? [];
  },
  getOtherSigners: () => [],
}));
vi.mock('@/libs/keyring/public-keyring', () => ({
  default: class {
    getAccounts = async () => [];
  },
}));
vi.mock('@/libs/messenger/extension', () => ({
  sendToBackgroundFromAction: mocks.sendToBackgroundFromAction,
}));
vi.mock('@/libs/metrics', () => ({ trackNetwork: vi.fn() }));
vi.mock('@/libs/utils/screening', () => ({
  isWalletRestricted: async (address: string) =>
    mocks.restrictedAddresses.includes(address),
}));
vi.mock('@/providers/ethereum/libs/accounts-state', mocks.accountState);
vi.mock('@/providers/bitcoin/libs/accounts-state', mocks.accountState);
vi.mock('@/providers/solana/libs/accounts-state', mocks.accountState);

const networks = mocks.networks as Record<string, BaseNetwork>;

/** Lets the work a store action leaves running (tab messages, balances) finish. */
const settle = () => new Promise(resolve => setTimeout(resolve));

/** The messages sent to the background, as `[method, params]`, unwrapping sendToTab. */
const sentMessages = () =>
  mocks.sendToBackgroundFromAction.mock.calls.map(([call]) => {
    const message = JSON.parse((call as { message: string }).message);
    return message.method === InternalMethods.sendToTab
      ? [message.params[0].method, message.params[0].params]
      : [message.method, message.params];
  });

/** The provider and tab each message was addressed to. */
const sentRouting = () =>
  mocks.sendToBackgroundFromAction.mock.calls.map(([call]) => {
    const { provider, tabId } = call as { provider: string; tabId: number };
    return { provider, tabId };
  });

beforeEach(() => {
  setActivePinia(createPinia());
  mocks.saved.network = null;
  mocks.saved.subNetwork = null;
  mocks.saved.address = null;
  mocks.accountsDelay = {};
  mocks.balances.until = Promise.resolve();
  mocks.networkSaves.until = Promise.resolve();
  mocks.restrictedAddresses = [];
  mocks.sendToBackgroundFromAction.mockClear();
  mocks.addApprovedAddress.mockClear();
});

describe('networks store', () => {
  describe('init', () => {
    it('restores the network saved for the domain, with its accounts', async () => {
      mocks.saved.network = 'BTC';
      const networksStore = useNetworksStore();
      await networksStore.init();
      expect(networksStore.currentNetwork.name).toBe('BTC');
      expect(useAccountsStore().activeAccounts.map(a => a.address)).toEqual([
        'bc1aaa',
      ]);
      expect(networksStore.allNetworks).toHaveLength(4);
    });

    it('falls back to the default network when nothing is saved', async () => {
      const networksStore = useNetworksStore();
      await networksStore.init();
      expect(networksStore.currentNetwork.name).toBe('ETH');
      expect(mocks.saved.network).toBe('ETH');
    });

    it('falls back to the default network when the saved one no longer exists', async () => {
      mocks.saved.network = 'REMOVED';
      const networksStore = useNetworksStore();
      await networksStore.init();
      expect(networksStore.currentNetwork.name).toBe('ETH');
      expect(mocks.saved.network).toBe('ETH');
    });
  });

  describe('setCurrentNetwork', () => {
    it('saves the network in DomainState', async () => {
      const networksStore = useNetworksStore();
      await networksStore.setCurrentNetwork(networks.BTC!);
      expect(networksStore.currentNetwork.name).toBe('BTC');
      expect(mocks.saved.network).toBe('BTC');
    });

    it('tells the background and the dapp about a new EVM network', async () => {
      mocks.saved.network = 'ETH';
      await useNetworksStore().setCurrentNetwork(networks.MATIC!);
      await settle();
      expect(sentMessages()).toEqual([
        [InternalMethods.changeNetwork, ['MATIC']],
        [MessageMethod.changeChainId, ['0x89']],
        [EnkryptProviderEventMethods.chainChanged, ['MATIC']],
      ]);
    });

    it('only sends chainChanged when the network was already the saved one', async () => {
      mocks.saved.network = 'ETH';
      await useNetworksStore().setCurrentNetwork(networks.ETH!);
      await settle();
      expect(sentMessages()).toEqual([
        [EnkryptProviderEventMethods.chainChanged, ['ETH']],
      ]);
    });

    it('tells a Kadena dapp about the new network', async () => {
      mocks.saved.network = 'ETH';
      await useNetworksStore().setCurrentNetwork(networks.KDA!);
      await settle();
      expect(sentMessages()).toEqual([
        [KadenaMessageMethod.changeNetwork, ['KDA']],
        [EnkryptProviderEventMethods.chainChanged, ['KDA']],
      ]);
    });

    it('addresses every message to the network provider and the active tab', async () => {
      mocks.saved.network = 'ETH';
      await useNetworksStore().setCurrentNetwork(networks.MATIC!);
      await settle();
      expect(sentRouting()).toEqual([
        { provider: 'ethereum', tabId: 7 },
        { provider: 'ethereum', tabId: 7 },
        { provider: 'ethereum', tabId: 7 },
      ]);
    });

    it('announces a change once when the same network is selected again', async () => {
      mocks.saved.network = 'ETH';
      const networksStore = useNetworksStore();
      await networksStore.setCurrentNetwork(networks.MATIC!);
      await networksStore.setCurrentNetwork(networks.MATIC!);
      await settle();
      expect(sentMessages()).toEqual([
        [InternalMethods.changeNetwork, ['MATIC']],
        [MessageMethod.changeChainId, ['0x89']],
        [EnkryptProviderEventMethods.chainChanged, ['MATIC']],
        [EnkryptProviderEventMethods.chainChanged, ['MATIC']],
      ]);
    });

    it('announces the change when the network is selected again while it is being saved', async () => {
      mocks.saved.network = 'ETH';
      let release = () => {};
      mocks.networkSaves.until = new Promise(resolve => (release = resolve));
      const networksStore = useNetworksStore();
      const first = networksStore.setCurrentNetwork(networks.MATIC!);
      await settle();
      const second = networksStore.setCurrentNetwork(networks.MATIC!);
      await settle();
      release();
      await Promise.all([first, second]);
      await settle();
      expect(mocks.saved.network).toBe('MATIC');
      const sent = sentMessages();
      expect(sent).toContainEqual([InternalMethods.changeNetwork, ['MATIC']]);
      expect(sent).toContainEqual([MessageMethod.changeChainId, ['0x89']]);
      expect(sent).toHaveLength(4);
    });

    it('ignores a call that is overtaken by a later one', async () => {
      let releaseBtc = () => {};
      mocks.accountsDelay.BTC = new Promise(resolve => (releaseBtc = resolve));
      const networksStore = useNetworksStore();
      const slow = networksStore.setCurrentNetwork(networks.BTC!);
      await networksStore.setCurrentNetwork(networks.MATIC!);
      releaseBtc();
      await slow;
      await settle();
      expect(networksStore.currentNetwork.name).toBe('MATIC');
      expect(mocks.saved.network).toBe('MATIC');
      expect(useAccountsStore().activeAccounts[0]!.address).toBe('0xaaa');
      expect(sentMessages().flat(2)).not.toContain('BTC');
    });

    it('screens the selected account of the new network', async () => {
      mocks.restrictedAddresses = ['0xaaa'];
      await useNetworksStore().setCurrentNetwork(networks.ETH!);
      await settle();
      expect(useAccountsStore().isAddressRestricted).toEqual({
        isRestricted: true,
        address: '0xaaa',
      });
    });
  });

  describe('sub-network', () => {
    it('is empty for a network without sub-networks', async () => {
      mocks.saved.subNetwork = '1';
      const networksStore = useNetworksStore();
      await networksStore.setCurrentNetwork(networks.ETH!);
      expect(networksStore.currentSubNetwork).toBe('');
    });

    it('uses the saved sub-network when the network has it', async () => {
      mocks.saved.subNetwork = '1';
      const networksStore = useNetworksStore();
      await networksStore.setCurrentNetwork(networks.KDA!);
      expect(networksStore.currentSubNetwork).toBe('1');
    });

    it('falls back to the first sub-network and saves it', async () => {
      mocks.saved.subNetwork = '99';
      const networksStore = useNetworksStore();
      await networksStore.setCurrentNetwork(networks.KDA!);
      expect(networksStore.currentSubNetwork).toBe('0');
      expect(mocks.saved.subNetwork).toBe('0');
    });

    it('is cleared when moving to a network without sub-networks', async () => {
      const networksStore = useNetworksStore();
      await networksStore.setCurrentNetwork(networks.KDA!);
      expect(networksStore.currentSubNetwork).toBe('0');
      await networksStore.setCurrentNetwork(networks.ETH!);
      expect(networksStore.currentSubNetwork).toBe('');
    });

    it('setCurrentSubNetwork saves the selection', async () => {
      const networksStore = useNetworksStore();
      await networksStore.setCurrentNetwork(networks.KDA!);
      await networksStore.setCurrentSubNetwork('1');
      expect(networksStore.currentSubNetwork).toBe('1');
      expect(mocks.saved.subNetwork).toBe('1');
    });
  });
});

describe('accounts store', () => {
  it('selects the saved address when the network has it', async () => {
    mocks.saved.address = '0xbbb';
    await useNetworksStore().setCurrentNetwork(networks.ETH!);
    expect(useAccountsStore().selectedAccount?.address).toBe('0xbbb');
  });

  it('selects the first account when the saved address is not on the network', async () => {
    mocks.saved.address = '0xbbb';
    await useNetworksStore().setCurrentNetwork(networks.BTC!);
    expect(useAccountsStore().selectedAccount?.address).toBe('bc1aaa');
  });

  it('has no selected account when the network has none', async () => {
    const accounts = await useAccountsStore().fetchAccounts({
      ...networks.ETH,
      name: 'EMPTY',
    } as unknown as BaseNetwork);
    expect(accounts.selectedAccount).toBeNull();
    expect(accounts.activeBalances).toEqual([]);
  });

  it('shows balances as loading until they arrive', async () => {
    let release = () => {};
    mocks.balances.until = new Promise(resolve => (release = resolve));
    await useNetworksStore().setCurrentNetwork(networks.ETH!);
    const accountsStore = useAccountsStore();
    await settle();
    expect(accountsStore.activeBalances).toEqual(['~', '~']);
    release();
    await settle();
    expect(accountsStore.activeBalances).toEqual(['2', '2']);
  });

  it('does not put balances on accounts that were loaded afterwards', async () => {
    let release = () => {};
    mocks.balances.until = new Promise(resolve => (release = resolve));
    await useNetworksStore().setCurrentNetwork(networks.ETH!);
    const accountsStore = useAccountsStore();
    accountsStore.setAccounts({
      activeAccounts: [],
      inactiveAccounts: [],
      selectedAccount: null,
      activeBalances: ['kept'],
    });
    release();
    await settle();
    expect(accountsStore.activeBalances).toEqual(['kept']);
  });

  describe('selectAccount', () => {
    const second = () => mocks.accounts.ETH![1] as EnkryptAccount;

    it('saves the address, approves it for the domain and tells the dapp', async () => {
      await useNetworksStore().setCurrentNetwork(networks.ETH!);
      await settle();
      mocks.sendToBackgroundFromAction.mockClear();
      const accountsStore = useAccountsStore();
      await accountsStore.selectAccount(second());
      expect(accountsStore.selectedAccount?.address).toBe('0xbbb');
      expect(mocks.saved.address).toBe('0xbbb');
      expect(mocks.addApprovedAddress).toHaveBeenCalledWith(
        '0xbbb',
        'example.com',
      );
      expect(sentMessages()).toEqual([
        [MessageMethod.changeAddress, ['0xbbb']],
      ]);
    });

    it('approves the address on Bitcoin as well', async () => {
      await useNetworksStore().setCurrentNetwork(networks.BTC!);
      await useAccountsStore().selectAccount(
        mocks.accounts.BTC![0] as EnkryptAccount,
      );
      expect(mocks.addApprovedAddress).toHaveBeenCalledWith(
        'bc1aaa',
        'example.com',
      );
    });

    it('has no approved addresses to update on Kadena', async () => {
      await useNetworksStore().setCurrentNetwork(networks.KDA!);
      await useAccountsStore().selectAccount(
        mocks.accounts.KDA![0] as EnkryptAccount,
      );
      expect(mocks.addApprovedAddress).not.toHaveBeenCalled();
      expect(mocks.saved.address).toBe('k:aaa');
    });

    it('does not save or announce a restricted address', async () => {
      await useNetworksStore().setCurrentNetwork(networks.ETH!);
      await settle();
      mocks.sendToBackgroundFromAction.mockClear();
      mocks.restrictedAddresses = ['0xbbb'];
      const accountsStore = useAccountsStore();
      await accountsStore.selectAccount(second());
      expect(accountsStore.isAddressRestricted).toEqual({
        isRestricted: true,
        address: '0xbbb',
      });
      expect(mocks.saved.address).toBeNull();
      expect(sentMessages()).toEqual([]);
    });

    it('switchToUnrestrictedAccount moves off the restricted address', async () => {
      await useNetworksStore().setCurrentNetwork(networks.ETH!);
      await settle();
      mocks.restrictedAddresses = ['0xbbb'];
      const accountsStore = useAccountsStore();
      await accountsStore.selectAccount(second());
      await accountsStore.switchToUnrestrictedAccount();
      expect(accountsStore.selectedAccount?.address).toBe('0xaaa');
      expect(accountsStore.isAddressRestricted.isRestricted).toBe(false);
      expect(mocks.saved.address).toBe('0xaaa');
    });
  });
});
