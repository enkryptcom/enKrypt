import { describe, it, expect, vi } from 'vitest';
import bitcoinNetworks from '../networks';

vi.mock('@/libs/spark-handler/generateSparkWallet', () => ({
  getSparkState: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/providers/bitcoin/libs/firo-wallet/firo-wallet', () => ({
  FiroWallet: vi.fn(),
}));

const pubkey =
  '0x021aa21d5f77b1be591d0a0a847cb7412a344f4e768b93d55b3eeab3b7e8a4a252';
describe('Should derive proper bitcoin addresses', () => {
  it('should derive segwit address', async () => {
    const bitcoinMain = bitcoinNetworks.bitcoin;
    expect(bitcoinMain.displayAddress(pubkey)).to.be.eq(
      'bc1qnjmf6vcjpyru5t8y2936260mrqa305qactwds2',
    );
    const bitcoinTest = bitcoinNetworks.bitcoinTest;
    expect(bitcoinTest.displayAddress(pubkey)).to.be.eq(
      'tb1qnjmf6vcjpyru5t8y2936260mrqa305qajd47te',
    );
  });
});
