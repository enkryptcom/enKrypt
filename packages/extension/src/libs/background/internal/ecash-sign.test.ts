import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworkNames, SignerType, WalletType } from '@enkryptcom/types';
import type { RPCRequestType, EnkryptAccount } from '@enkryptcom/types';

const {
  mockBroadcast,
  mockBuild,
  mockAction,
  mockSync,
  mockUtxos,
  mockSpendableSatsOnlyUtxos,
  mockGetNetworkByName,
} = vi.hoisted(() => {
  const mockBroadcast = vi.fn();
  const mockBuild = vi.fn().mockReturnValue({ broadcast: mockBroadcast });
  const mockAction = vi.fn().mockReturnValue({ build: mockBuild });
  const mockSync = vi.fn();
  const mockUtxos: any[] = [];
  const mockSpendableSatsOnlyUtxos = vi.fn().mockReturnValue([]);
  const mockGetNetworkByName = vi.fn();
  return {
    mockBroadcast,
    mockBuild,
    mockAction,
    mockSync,
    mockUtxos,
    mockSpendableSatsOnlyUtxos,
    mockGetNetworkByName,
  };
});

vi.mock('ecash-wallet', () => ({
  Wallet: {
    fromSk: vi.fn().mockReturnValue({
      sync: mockSync,
      get utxos() {
        return mockUtxos;
      },
      spendableSatsOnlyUtxos: mockSpendableSatsOnlyUtxos,
      action: mockAction,
    }),
  },
}));

vi.mock('chronik-client', () => ({
  ChronikClient: class MockChronikClient {
    constructor() {}
  },
}));

vi.mock('@/libs/utils/networks', () => ({
  getNetworkByName: mockGetNetworkByName,
}));

import ecashSign from './ecash-sign';

const fakePrivateKey = Buffer.from(
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'hex',
);

const baseAccount: EnkryptAccount = {
  name: 'eCash Account',
  address: 'ecash:qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63',
  basePath: "m/44'/1899'/0'/0",
  pathIndex: 0,
  publicKey:
    '0x031c6d8a90254cc6dda7012c184bcde32e8d53f6fd6c882b2b12bd3fca1bd7372f',
  signerType: SignerType.secp256k1ecash,
  walletType: WalletType.mnemonic,
  isHardware: false,
};

const makeMessage = (params?: any[]): RPCRequestType => ({
  method: 'enkrypt_ecash_sign',
  params,
});

const createKeyring = (overrides: Record<string, any> = {}) =>
  ({
    isLocked: vi.fn().mockReturnValue(false),
    getPrivateKeyForECash: vi.fn().mockResolvedValue(fakePrivateKey),
    ...overrides,
  }) as any;

describe('ecashSign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUtxos.length = 0;
    mockSpendableSatsOnlyUtxos.mockReturnValue([]);
    mockBroadcast.mockResolvedValue({
      success: true,
      broadcasted: ['abc123txid'],
    });
    mockGetNetworkByName.mockResolvedValue({
      node: 'https://chronik-native1.fabien.cash',
      name: NetworkNames.ECash,
    });
  });

  it('should return error when params is undefined', async () => {
    const keyring = createKeyring();
    const result = await ecashSign(keyring, makeMessage(undefined));

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('invalid params');
  });

  it('should return error when toAddress is missing', async () => {
    const keyring = createKeyring();
    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          amount: '1000',
          account: baseAccount,
          networkName: NetworkNames.ECash,
        },
      ]),
    );

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('missing required parameters');
  });

  it('should return error when keyring is locked', async () => {
    const keyring = createKeyring({
      isLocked: vi.fn().mockReturnValue(true),
    });
    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          toAddress: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          amount: '1000',
          account: baseAccount,
          networkName: NetworkNames.ECash,
        },
      ]),
    );

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('keyring is locked');
  });

  it('should return error when network is not found', async () => {
    const keyring = createKeyring();
    mockGetNetworkByName.mockResolvedValue(undefined);

    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          toAddress: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          amount: '1000',
          account: baseAccount,
          networkName: 'fake_network',
        },
      ]),
    );

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('unknown network');
  });

  it('should return error for hardware wallet (isHardware flag)', async () => {
    const keyring = createKeyring();
    const hwAccount = { ...baseAccount, isHardware: true };
    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          toAddress: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          amount: '1000',
          account: hwAccount,
          networkName: NetworkNames.ECash,
        },
      ]),
    );

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain(
      'hardware wallets not yet supported',
    );
  });

  it('should build and broadcast a successful XEC transaction', async () => {
    const keyring = createKeyring();
    mockSpendableSatsOnlyUtxos.mockReturnValue([{ sats: 50000n }]);
    mockBroadcast.mockResolvedValue({
      success: true,
      broadcasted: ['txid_xec_success'],
    });

    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          toAddress: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          amount: '10000',
          account: baseAccount,
          networkName: NetworkNames.ECash,
        },
      ]),
    );

    expect(result.error).toBeUndefined();
    expect(result.result).toBeDefined();
    const parsed = JSON.parse(result.result!);
    expect(parsed.txid).toBe('txid_xec_success');

    expect(mockSync).toHaveBeenCalled();
    expect(mockAction).toHaveBeenCalledWith({
      outputs: [
        {
          address: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          sats: 10000n,
        },
      ],
    });
    expect(mockBuild).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalled();
  });

  it('should return error when XEC balance is insufficient', async () => {
    const keyring = createKeyring();
    mockSpendableSatsOnlyUtxos.mockReturnValue([{ sats: 500n }]);

    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          toAddress: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          amount: '10000',
          account: baseAccount,
          networkName: NetworkNames.ECash,
        },
      ]),
    );

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('Insufficient balance');
  });

  it('should return error when broadcast fails with errors array', async () => {
    const keyring = createKeyring();
    mockSpendableSatsOnlyUtxos.mockReturnValue([{ sats: 50000n }]);
    mockBroadcast.mockResolvedValue({
      success: false,
      errors: ['tx-mempool-conflict', 'bad-txns-inputs-missingorspent'],
    });

    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          toAddress: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          amount: '1000',
          account: baseAccount,
          networkName: NetworkNames.ECash,
        },
      ]),
    );

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('tx-mempool-conflict');
    expect(result.error!.message).toContain('bad-txns-inputs-missingorspent');
  });

  it('should return generic error when broadcast fails without errors', async () => {
    const keyring = createKeyring();
    mockSpendableSatsOnlyUtxos.mockReturnValue([{ sats: 50000n }]);
    mockBroadcast.mockResolvedValue({
      success: false,
      errors: [],
    });

    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          toAddress: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          amount: '1000',
          account: baseAccount,
          networkName: NetworkNames.ECash,
        },
      ]),
    );

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('Broadcast failed');
  });

  it('should return error when wallet.sync() throws', async () => {
    const keyring = createKeyring();
    mockSync.mockRejectedValueOnce(new Error('Network unreachable'));

    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          toAddress: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          amount: '1000',
          account: baseAccount,
          networkName: NetworkNames.ECash,
        },
      ]),
    );

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('Network unreachable');
  });

  it('should return error when getPrivateKeyForECash throws', async () => {
    const keyring = createKeyring({
      getPrivateKeyForECash: vi
        .fn()
        .mockRejectedValue(new Error('Keyring error')),
    });

    const result = await ecashSign(
      keyring,
      makeMessage([
        {
          toAddress: 'ecash:qqq9wk7vze4dc4hk7mweafpyxh7d8sjr3ghh0wtn04',
          amount: '1000',
          account: baseAccount,
          networkName: NetworkNames.ECash,
        },
      ]),
    );

    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('Keyring error');
  });
});
