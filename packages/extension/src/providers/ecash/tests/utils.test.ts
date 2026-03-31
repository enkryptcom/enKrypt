import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidECashAddress,
  scriptToAddress,
  clearScriptAddressCache,
  extractSats,
  sumSatoshis,
  calculateTransactionValue,
  calculateOnchainTxFee,
  getTransactionAddresses,
  getTransactionTimestamp,
} from '../libs/utils';

describe('ECash Utils Tests', () => {
  describe('isValidECashAddress', () => {
    it('should validate correct eCash address with prefix', () => {
      const validAddress = 'ecash:qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63';
      expect(isValidECashAddress(validAddress)).toBe(true);
    });

    it('should validate correct eCash address without prefix (default ecash)', () => {
      const validAddress = 'qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63';
      expect(isValidECashAddress(validAddress)).toBe(true);
    });

    it('should validate correct ectest address without prefix', () => {
      const validAddress = 'qz5fdmzx8cdqspevemxe20z94y6689zhdqm5xdfvsm';
      expect(isValidECashAddress(validAddress, 'ectest')).toBe(true);
    });

    it('should reject ecash address when ectest prefix is expected', () => {
      const validEcashAddress =
        'ecash:qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63';
      expect(isValidECashAddress(validEcashAddress, 'ectest')).toBe(false);
    });

    it('should reject ectest address when ecash prefix is expected', () => {
      const ectestAddress = 'ectest:qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63';
      expect(isValidECashAddress(ectestAddress, 'ecash')).toBe(false);
    });

    it('should reject invalid eCash address', () => {
      const invalidAddress = 'invalid_address_123';
      expect(isValidECashAddress(invalidAddress)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidECashAddress('')).toBe(false);
    });

    it('should use ecash as default prefix', () => {
      const validAddress = 'ecash:qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63';
      expect(isValidECashAddress(validAddress)).toBe(true);
      expect(isValidECashAddress(validAddress, 'ecash')).toBe(true);
    });
  });

  describe('scriptToAddress', () => {
    beforeEach(() => {
      clearScriptAddressCache();
    });

    it('should convert script hex to address', () => {
      const scriptHex = '76a9142aa5b50d61a930bc280c9a53165c0dbbc46daef488ac';
      const address = scriptToAddress(scriptHex);
      expect(address).toBe('qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63');
    });

    it('should return Unknown for empty script', () => {
      expect(scriptToAddress('')).to.equal('Unknown');
    });

    it('should return fallback for invalid script', () => {
      const invalidScript = 'invalid';
      const result = scriptToAddress(invalidScript);
      expect(result).to.equal('invalid');
    });

    it('should truncate long invalid scripts', () => {
      const longInvalidScript = '1234567890abcdef1234567890abcdef1234567890';
      const result = scriptToAddress(longInvalidScript);
      expect(result).to.include('...');
      expect(result.length).to.be.lessThan(longInvalidScript.length);
    });
  });

  describe('extractSats', () => {
    it('should extract sats from item with sats property', () => {
      const item = { sats: 1000 };
      expect(extractSats(item)).to.equal('1000');
    });

    it('should return 0 for item without sats', () => {
      const item = {};
      expect(extractSats(item)).to.equal('0');
    });

    it('should return 0 for null item', () => {
      expect(extractSats(null)).to.equal('0');
    });

    it('should return 0 for undefined item', () => {
      expect(extractSats(undefined)).to.equal('0');
    });
  });

  describe('sumSatoshis', () => {
    it('should sum satoshis from multiple items', () => {
      const items = [{ sats: 1000 }, { sats: 2000 }, { sats: 3000 }];
      expect(sumSatoshis(items)).to.equal('6000');
    });

    it('should return 0 for empty array', () => {
      expect(sumSatoshis([])).to.equal('0');
    });

    it('should handle items without sats property', () => {
      const items = [{ sats: 1000 }, {}, { sats: 2000 }];
      expect(sumSatoshis(items)).to.equal('3000');
    });

    it('should handle large values', () => {
      const items = [
        { sats: 999999999999 },
        { sats: 888888888888 },
        { sats: 777777777777 },
      ];
      expect(sumSatoshis(items)).to.equal('2666666666664');
    });
  });

  describe('calculateTransactionValue', () => {
    beforeEach(() => {
      clearScriptAddressCache();
    });

    it('should calculate received value', () => {
      const outputs = [
        {
          outputScript: '76a914a8a56cc4f5a2e2a3e6b7f8c9d0e1f2a3b4c5d6e788ac',
          sats: 1000,
        },
        {
          outputScript: '76a914b9b67dd5f6b3f3b4f7c8d9e0f1a2b3c4d5e6f788ac',
          sats: 2000,
        },
      ];
      const normalizedAddress = scriptToAddress(outputs[0].outputScript);
      const value = calculateTransactionValue(
        outputs,
        [normalizedAddress],
        true,
      );
      expect(value).to.equal('1000');
    });

    it('should calculate sent value', () => {
      const outputs = [
        {
          outputScript: '76a914a8a56cc4f5a2e2a3e6b7f8c9d0e1f2a3b4c5d6e788ac',
          sats: 1000,
        },
        {
          outputScript: '76a914b9b67dd5f6b3f3b4f7c8d9e0f1a2b3c4d5e6f788ac',
          sats: 2000,
        },
      ];
      const normalizedAddress = scriptToAddress(outputs[0].outputScript);
      const value = calculateTransactionValue(
        outputs,
        [normalizedAddress],
        false,
      );
      expect(value).to.equal('2000');
    });

    it('should return 0 for no matching outputs', () => {
      const outputs = [
        {
          outputScript: '76a914a8a56cc4f5a2e2a3e6b7f8c9d0e1f2a3b4c5d6e788ac',
          sats: 1000,
        },
      ];
      const value = calculateTransactionValue(
        outputs,
        ['nonexistent_address'],
        true,
      );
      expect(value).to.equal('0');
    });
  });

  describe('calculateOnchainTxFee', () => {
    it('should calculate transaction fee correctly', () => {
      const tx = {
        inputs: [{ sats: 10000 }, { sats: 5000 }],
        outputs: [{ sats: 7000 }, { sats: 7500 }],
      };
      const fee = calculateOnchainTxFee(tx);
      expect(fee).to.equal(500);
    });

    it('should return 0 fee when inputs equal outputs', () => {
      const tx = {
        inputs: [{ sats: 10000 }],
        outputs: [{ sats: 10000 }],
      };
      const fee = calculateOnchainTxFee(tx);
      expect(fee).to.equal(0);
    });

    it('should handle large fee calculations', () => {
      const tx = {
        inputs: [{ sats: 1000000000 }],
        outputs: [{ sats: 999990000 }],
      };
      const fee = calculateOnchainTxFee(tx);
      expect(fee).to.equal(10000);
    });
  });

  describe('getTransactionAddresses', () => {
    beforeEach(() => {
      clearScriptAddressCache();
    });

    it('should get addresses for received transaction', () => {
      const tx = {
        inputs: [
          {
            outputScript: '76a914a8a56cc4f5a2e2a3e6b7f8c9d0e1f2a3b4c5d6e788ac',
          },
        ],
        outputs: [
          {
            outputScript: '76a9142aa5b50d61a930bc280c9a53165c0dbbc46daef488ac',
            sats: 1000,
          },
        ],
      };
      // The owned address matches the output script above
      const normalizedAddress = 'qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63';
      const { fromAddress, toAddress } = getTransactionAddresses(
        tx,
        [normalizedAddress],
        true,
        false,
      );
      expect(fromAddress).to.be.a('string');
      expect(toAddress).to.equal(normalizedAddress);
    });

    it('should get addresses for sent transaction', () => {
      const tx = {
        inputs: [
          {
            outputScript: '76a914a8a56cc4f5a2e2a3e6b7f8c9d0e1f2a3b4c5d6e788ac',
          },
        ],
        outputs: [
          {
            outputScript: '76a9142aa5b50d61a930bc280c9a53165c0dbbc46daef488ac',
            sats: 1000,
          },
          {
            outputScript: '76a914b9b67dd5f6b3f3b4f7c8d9e0f1a2b3c4d5e6f788ac',
            sats: 2000,
          },
        ],
      };
      // owned address is the first output (change), recipient is the second
      const normalizedAddress = 'qq42tdgdvx5np0pgpjd9x9jupkaugmdw7sjp5dqa63';
      const { fromAddress, toAddress } = getTransactionAddresses(
        tx,
        [normalizedAddress],
        false,
        true,
      );
      expect(fromAddress).to.equal(normalizedAddress);
      expect(toAddress).to.be.a('string');
      expect(toAddress).to.not.equal(normalizedAddress);
    });

    it('should return Unknown for missing data', () => {
      const tx = {
        inputs: [],
        outputs: [],
      };
      const { fromAddress, toAddress } = getTransactionAddresses(
        tx,
        ['someaddress'],
        false,
        false,
      );
      expect(fromAddress).to.equal('Unknown');
      expect(toAddress).to.equal('Unknown');
    });
  });

  describe('getTransactionTimestamp', () => {
    it('should get timestamp from block (in seconds)', () => {
      const tx = {
        block: { timestamp: 1640000000 },
      };
      expect(getTransactionTimestamp(tx)).to.equal(1640000000);
    });

    it('should get timestamp from timeFirstSeen (in seconds)', () => {
      const tx = {
        timeFirstSeen: '1640000000',
      };
      expect(getTransactionTimestamp(tx)).to.equal(1640000000);
    });

    it('should prefer block timestamp over timeFirstSeen', () => {
      const tx = {
        block: { timestamp: 1640000000 },
        timeFirstSeen: '1630000000',
      };
      expect(getTransactionTimestamp(tx)).to.equal(1640000000);
    });

    it('should return current time in seconds for transaction without timestamp', () => {
      const tx = {};
      const timestamp = getTransactionTimestamp(tx);
      const nowSeconds = Math.floor(Date.now() / 1000);
      expect(timestamp).to.be.closeTo(nowSeconds, 2);
    });
  });
});
