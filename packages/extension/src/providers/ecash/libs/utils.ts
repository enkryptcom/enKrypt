import { Address } from 'ecash-lib';
import { toBN } from 'web3-utils';

export const isValidECashAddress = (address: string): boolean => {
  try {
    const addr = Address.parse(address);
    return Boolean(addr);
  } catch {
    return false;
  }
};

const scriptAddressCache = new Map<string, string>();

export function scriptToAddress(script: string): string {
  if (!script) return 'Unknown';

  if (scriptAddressCache.has(script)) {
    return scriptAddressCache.get(script)!;
  }

  try {
    const address = Address.fromScriptHex(script);
    const addressWithoutPrefix = getAddressWithoutPrefix(address);

    scriptAddressCache.set(script, addressWithoutPrefix);
    return addressWithoutPrefix;
  } catch (error) {
    console.error('[scriptToAddress] Error:', error, script.slice(0, 20));

    const fallback =
      script.length > 20
        ? `${script.slice(0, 8)}...${script.slice(-8)}`
        : script;

    scriptAddressCache.set(script, fallback);
    return fallback;
  }
}

export function clearScriptAddressCache(): void {
  scriptAddressCache.clear();
}

export function extractSats(item: any): string {
  return item?.sats ? item.sats.toString() : '0';
}

export function sumSatoshis(items: any[]): string {
  return items.reduce((sum, item) => {
    return toBN(sum)
      .add(toBN(extractSats(item)))
      .toString();
  }, '0');
}

/**
 * Calculate transaction value for receive or send
 * @param outputs - Array of transaction outputs
 * @param normalizedAddress - The address to check against
 * @param isReceive - true for received funds, false for sent funds
 */
export function calculateTransactionValue(
  outputs: any[],
  normalizedAddress: string,
  isReceive: boolean,
): string {
  return outputs
    .filter((output: any) => {
      const outputAddress = scriptToAddress(output.outputScript);
      return isReceive
        ? outputAddress === normalizedAddress
        : outputAddress !== normalizedAddress;
    })
    .reduce((sum: string, output: any) => {
      return toBN(sum)
        .add(toBN(extractSats(output)))
        .toString();
    }, '0');
}

export function calculateOnchainTxFee(tx: any): number {
  const totalInput = sumSatoshis(tx.inputs);
  const totalOutput = sumSatoshis(tx.outputs);
  return Number(toBN(totalInput).sub(toBN(totalOutput)).toString());
}

export function getTransactionAddresses(
  tx: any,
  normalizedAddress: string,
  isReceive: boolean,
  isSend: boolean,
): { fromAddress: string; toAddress: string } {
  let fromAddress = 'Unknown';
  let toAddress = 'Unknown';

  if (isReceive) {
    fromAddress = tx.inputs[0]?.outputScript
      ? scriptToAddress(tx.inputs[0].outputScript)
      : 'Unknown';
    toAddress = normalizedAddress;
  } else if (isSend) {
    fromAddress = normalizedAddress;
    const recipientOutput = tx.outputs.find((output: any) => {
      const outputAddress = scriptToAddress(output.outputScript);
      return outputAddress !== normalizedAddress;
    });
    toAddress = recipientOutput
      ? scriptToAddress(recipientOutput.outputScript)
      : 'Unknown';
  }

  return { fromAddress, toAddress };
}

export function getTransactionTimestamp(tx: any): number {
  if (tx.block?.timestamp) {
    return tx.block.timestamp * 1000;
  }
  if (tx.timeFirstSeen) {
    return parseInt(tx.timeFirstSeen) * 1000;
  }
  return Date.now();
}

export function getAddressWithoutPrefix(address: Address | string): string {
  const fullAddress =
    typeof address === 'string' ? address : address.toString();
  return fullAddress.replace(/^ecash:/, '');
}
