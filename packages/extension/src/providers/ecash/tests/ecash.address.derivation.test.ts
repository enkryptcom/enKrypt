import { describe, it, expect } from 'vitest';
import ecash from '../networks';

const pubkey =
  '0x031c6d8a90254cc6dda7012c184bcde32e8d53f6fd6c882b2b12bd3fca1bd7372f';
describe('Should derive proper ecash addresses', () => {
  it('should derive address', async () => {
    const ecashMain = ecash.XEC;
    expect(ecashMain.displayAddress(pubkey)).to.be.eq(
      'qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63',
    );
  });
});
