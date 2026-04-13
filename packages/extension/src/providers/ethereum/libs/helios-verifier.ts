/**
 * helios-verifier.ts
 *
 * Experimental light-client verification layer using Helios (@a16z/helios).
 * Only active on Ethereum mainnet (chainId 0x1).
 */

export interface VerificationResult {
  verified: boolean;
  tampered: boolean;
  message: string;
  provenBalance?: string;
}

const SKIP: VerificationResult = { verified: false, tampered: false, message: '' };
const MAINNET_CHAIN_ID = '0x1';
const DEFAULT_CONSENSUS_RPC = 'https://ethereum.operationsolarstorm.org';
const CHECKPOINT_FETCH_TIMEOUT_MS = 5_000;

let heliosProvider: any = null;
let initInProgress = false;
let isSynced = false;
let currentExecutionRpc = '';

async function fetchFreshCheckpoint(consensusRpc: string): Promise<string | undefined> {
  const url = `${consensusRpc.replace(/\/$/, '')}/eth/v1/beacon/headers/finalized`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECKPOINT_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return undefined;
    const json = (await res.json()) as { data?: { root?: string } };
    const root = json?.data?.root;
    if (typeof root === 'string' && root.startsWith('0x')) return root;
    return undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

export async function initHelios(
  executionRpc: string,
  consensusRpc: string = DEFAULT_CONSENSUS_RPC,
): Promise<void> {
  if (initInProgress) return;
  if (heliosProvider && currentExecutionRpc === executionRpc) return;
  initInProgress = true;
  heliosProvider = null;
  isSynced = false;
  currentExecutionRpc = executionRpc;
  try {
    const checkpoint = await fetchFreshCheckpoint(consensusRpc);
    const { createHeliosProvider } = await import('@a16z/helios');
    const config: Record<string, string> = {
      executionRpc,
      consensusRpc,
      network: 'mainnet',
    };
    if (checkpoint) config['checkpoint'] = checkpoint;
    heliosProvider = await createHeliosProvider(config, 'ethereum');
    heliosProvider
      .waitSynced()
      .then(() => { isSynced = true; console.log('[helios-verifier] synced and ready'); })
      .catch((err: unknown) => { console.warn('[helios-verifier] sync failed:', err); resetHelios(); });
  } catch (err) {
    console.warn('[helios-verifier] failed to initialise:', err);
    heliosProvider = null;
    currentExecutionRpc = '';
  } finally {
    initInProgress = false;
  }
}

export function resetHelios(): void {
  heliosProvider = null;
  isSynced = false;
  initInProgress = false;
  currentExecutionRpc = '';
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
  if (chainId.toLowerCase() !== MAINNET_CHAIN_ID) return SKIP;
  if (!heliosProvider && !initInProgress) void initHelios(executionRpc);
  if (!isSynced || !heliosProvider) return SKIP;
  let heliosBalanceHex: string;
  try {
    heliosBalanceHex = (await heliosProvider.request({
      method: 'eth_call',
      params: [{ to: contractAddress, data: encodeBalanceOf(walletAddress) }, 'latest'],
    })) as string;
  } catch (err) {
    console.warn('[helios-verifier] eth_call failed:', err);
    return SKIP;
  }
  const rpcValue = decodeUint256(rpcBalance);
  const heliosValue = decodeUint256(heliosBalanceHex);
  if (rpcValue === heliosValue) {
    return { verified: true, tampered: false, message: 'Balance verified by Helios light client.', provenBalance: heliosBalanceHex };
  }
  console.error(`[helios-verifier] MISMATCH: RPC=${rpcValue} Helios=${heliosValue}`);
  return {
    verified: false,
    tampered: true,
    message: `Your RPC provider returned ${rpcValue.toString()} but Helios proved the real balance is ${heliosValue.toString()}. Your RPC provider may be lying.`,
    provenBalance: heliosBalanceHex,
  };
}
