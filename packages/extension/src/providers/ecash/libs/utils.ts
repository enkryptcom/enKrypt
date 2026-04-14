import { Address } from 'ecash-lib';
import { toBN } from 'web3-utils';

export const isValidECashAddress = (
  address: string,
  cashAddrPrefix: string = 'ecash',
): boolean => {
  try {
    const addr = Address.parse(address);
    if (addr.prefix !== cashAddrPrefix) return false;
    if (!addr.hash || addr.hash.length === 0) return false;
    return true;
  } catch {
    return false;
  }
};

const scriptAddressCache = new Map<string, string>();

export function scriptToAddress(
  script: string,
  cashAddrPrefix: string = 'ecash',
): string {
  if (!script) return 'Unknown';

  const cacheKey = `${cashAddrPrefix}:${script}`;
  if (scriptAddressCache.has(cacheKey)) {
    return scriptAddressCache.get(cacheKey)!;
  }

  try {
    const address = Address.fromScriptHex(script, cashAddrPrefix);
    const addressWithoutPrefix = getAddressWithoutPrefix(address);

    scriptAddressCache.set(cacheKey, addressWithoutPrefix);
    return addressWithoutPrefix;
  } catch (error) {
    console.error('[scriptToAddress] Error:', error, script.slice(0, 20));

    const fallback =
      script.length > 20
        ? `${script.slice(0, 8)}...${script.slice(-8)}`
        : script;

    scriptAddressCache.set(cacheKey, fallback);
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
  return items
    .reduce((sum, item) => sum.add(toBN(extractSats(item))), toBN('0'))
    .toString();
}

/**
 * Calculate transaction value for receive or send
 * @param outputs - Array of transaction outputs
 * @param normalizedAddress - The address to check against
 * @param isReceive - true for received funds, false for sent funds
 * @param cashAddrPrefix - The cash address prefix (default: 'ecash')
 */
export function calculateTransactionValue(
  outputs: any[],
  ownedAddresses: string[],
  isReceive: boolean,
  cashAddrPrefix: string = 'ecash',
): string {
  const ownedSet = new Set(ownedAddresses);
  return outputs
    .filter((output: any) => {
      const outputAddress = scriptToAddress(
        output.outputScript,
        cashAddrPrefix,
      );
      return isReceive
        ? ownedSet.has(outputAddress)
        : !ownedSet.has(outputAddress);
    })
    .reduce((sum, output) => sum.add(toBN(extractSats(output))), toBN('0'))
    .toString();
}

export function calculateOnchainTxFee(tx: any): number {
  const totalInput = sumSatoshis(tx.inputs);
  const totalOutput = sumSatoshis(tx.outputs);
  return Number(toBN(totalInput).sub(toBN(totalOutput)).toString());
}

export function getTransactionAddresses(
  tx: any,
  ownedAddresses: string[],
  isReceive: boolean,
  isSend: boolean,
  cashAddrPrefix: string = 'ecash',
): { fromAddress: string; toAddress: string } {
  let fromAddress = 'Unknown';
  let toAddress = 'Unknown';
  const ownedSet = new Set(ownedAddresses);

  if (isReceive) {
    // From: first input (external sender)
    fromAddress = tx.inputs[0]?.outputScript
      ? scriptToAddress(tx.inputs[0].outputScript, cashAddrPrefix)
      : 'Unknown';
    // To: first owned address that received funds
    const receivingOutput = tx.outputs.find((output: any) => {
      const outputAddress = scriptToAddress(
        output.outputScript,
        cashAddrPrefix,
      );
      return ownedSet.has(outputAddress);
    });
    toAddress = receivingOutput
      ? scriptToAddress(receivingOutput.outputScript, cashAddrPrefix)
      : (ownedAddresses[0] ?? 'Unknown');
  } else if (isSend) {
    fromAddress = ownedAddresses[0] ?? 'Unknown';
    // To: first EXTERNAL output (not owned = recipient, not change)
    const recipientOutput = tx.outputs.find((output: any) => {
      const outputAddress = scriptToAddress(
        output.outputScript,
        cashAddrPrefix,
      );
      return !ownedSet.has(outputAddress);
    });
    toAddress = recipientOutput
      ? scriptToAddress(recipientOutput.outputScript, cashAddrPrefix)
      : 'Unknown';
  }

  return { fromAddress, toAddress };
}

export function getTransactionTimestamp(tx: any): number {
  if (tx.block?.timestamp) {
    return tx.block.timestamp;
  }
  if (tx.timeFirstSeen) {
    return Number(tx.timeFirstSeen);
  }
  return Math.floor(Date.now() / 1000);
}

export function getAddressWithoutPrefix(address: Address | string): string {
  const fullAddress =
    typeof address === 'string' ? address : address.toString();
  return fullAddress.replace(/^\w+:/, '');
}
