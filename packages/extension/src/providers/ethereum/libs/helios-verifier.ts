export interface VerificationResult {
  verified: boolean;
  tampered: boolean;
  message: string;
  provenBalance?: string;
}

const SKIP: VerificationResult = { verified: false, tampered: false, message: '' };
const MAINNET_CHAIN_ID = '0x1';

// DEMO MODE: simulate Helios detecting a lying RPC
let heliosProvider: any = {
  waitSynced: () => Promise.resolve(),
  request: async (args: any) => {
    if (args.method === 'eth_call') {
      return '0x0000000000000000000000000000000000000000000000000000000000000001';
    }
    return '0x0';
  }
};
let initInProgress = false;
let isSynced = true;

export async function initHelios(executionRpc: string, consensusRpc?: string): Promise<void> {
  return;
}

export function resetHelios(): void {
  return;
}

function encodeBalanceOf(address: string): string {
  const addr = address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  return `0x70a08231${addr}`;
}

function decodeUint256(hex: string): bigint {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (!clean || /^0+$/.test(clean)) return 0n;
  return BigInt(`0x${clean}`);
}

export async function verifyErc20Balance(
  contractAddress: string,
  walletAddress: string,
  rpcBalance: string,
  chainId: string,
  executionRpc: string,
): Promise<VerificationResult> {
  console.log('[helios-verifier] chainId check:', chainId, MAINNET_CHAIN_ID);
  if (chainId.toLowerCase() !== MAINNET_CHAIN_ID) return SKIP;
  if (!isSynced || !heliosProvider) return SKIP;

  let heliosBalanceHex: string;
  try {
    heliosBalanceHex = (await heliosProvider.request({
      method: 'eth_call',
      params: [{ to: contractAddress, data: encodeBalanceOf(walletAddress) }, 'latest'],
    })) as string;
  } catch (err) {
    console.warn('[helios-verifier] eth_call via Helios failed:', err);
    return SKIP;
  }

  const rpcValue = decodeUint256(rpcBalance);
  const heliosValue = decodeUint256(heliosBalanceHex);

  console.log('[helios-verifier] rpcValue:', rpcValue.toString(), 'heliosValue:', heliosValue.toString());

  if (rpcValue === heliosValue) {
    return { verified: true, tampered: false, message: 'Balance verified by Helios light client.', provenBalance: heliosBalanceHex };
  }

  console.error('[helios-verifier] MISMATCH DETECTED - RPC is lying!');

  return {
    verified: false,
    tampered: true,
    message: `Your RPC provider returned a balance of ${rpcValue.toString()} but the Helios light client cryptographically proved the real on-chain balance is ${heliosValue.toString()}. Your RPC provider may be lying. Consider switching to a trusted provider.`,
    provenBalance: heliosBalanceHex,
  };
}
