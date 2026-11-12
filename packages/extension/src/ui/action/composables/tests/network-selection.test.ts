import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseNetwork } from '@/types/base-network';
import networkSelectionComposable from '../network-selection';

const mocks = vi.hoisted(() => {
  /** Store actions and navigations, in the order they happened */
  const calls: string[] = [];
  const store = {
    currentNetwork: { name: 'ETH' },
    init: vi.fn(async () => {
      calls.push('init');
    }),
    setCurrentNetwork: vi.fn(async (network: { name: string }) => {
      store.currentNetwork = network;
      calls.push('setCurrentNetwork');
    }),
    setCurrentSubNetwork: vi.fn(async (id: string) => {
      calls.push(`setCurrentSubNetwork ${id}`);
    }),
  };
  return {
    calls,
    store,
    push: vi.fn(async (to: { name: string; params: { id: string } }) => {
      calls.push(`push ${to.name}/${to.params.id}`);
    }),
    backup: vi.fn<(firstTime: boolean) => Promise<boolean>>(async () => true),
  };
});

vi.mock('vue-router', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('@/libs/backup-state', () => ({
  default: class {
    backup = mocks.backup;
  },
}));
vi.mock('@action/store/networks-store', () => ({
  useNetworksStore: () => mocks.store,
}));

beforeEach(() => {
  mocks.calls.length = 0;
  mocks.store.currentNetwork = { name: 'ETH' };
  mocks.backup.mockReset().mockResolvedValue(true);
});

describe('network selection composable', () => {
  it('init loads the saved selection, backs up, then opens the assets', async () => {
    await networkSelectionComposable().init();
    expect(mocks.calls).toEqual(['init', 'push assets/ETH']);
    expect(mocks.backup).toHaveBeenCalledWith(true);
  });

  it('init still opens the assets when the backup fails', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.backup.mockRejectedValue(new Error('offline'));
    await networkSelectionComposable().init();
    expect(mocks.calls).toEqual(['init', 'push assets/ETH']);
    logged.mockRestore();
  });

  it('selectNetwork sets the network, then opens its assets', async () => {
    await networkSelectionComposable().selectNetwork({
      name: 'BTC',
    } as unknown as BaseNetwork);
    expect(mocks.calls).toEqual(['setCurrentNetwork', 'push assets/BTC']);
  });

  it('selectSubNetwork sets the sub-network, then opens the assets', async () => {
    await networkSelectionComposable().selectSubNetwork('3');
    expect(mocks.calls).toEqual(['setCurrentSubNetwork 3', 'push assets/ETH']);
  });
});
