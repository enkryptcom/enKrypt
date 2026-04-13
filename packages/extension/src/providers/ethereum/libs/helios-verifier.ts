
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
let initPromise: Promise<void> | null = null;
let syncPromise: Promise<void> | null = null;
let isSynced = false;
let currentExecutionRpc = '';
let sessionId = 0;

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
  if (initPromise) return initPromise;
  if (heliosProvider && currentExecutionRpc === executionRpc) return;
  const session = ++sessionId;
  heliosProvider = null;
  isSynced = false;
  currentExecutionRpc = executionRpc;
  initPromise = (async () => {
    try {
      const checkpoint = await fetchFreshCheckpoint(consensusRpc);
      const { createHeliosProvider } = await import('@a16z/helios');
      const config: Record<string, string> = {
        executionRpc,
        consensusRpc,
        network: 'mainnet',
      };
      if (checkpoint) config['checkpoint'] = checkpoint;
      const provider = await createHeliosProvider(config, 'ethereum');
      if (session !== sessionId) return;
      heliosProvider = provider;
      syncPromise = provider.waitSynced().then(() => {
        if (session === sessionId && heliosProvider === provider) {
          isSynced = true;
          console.log('[helios-verifier] synced and ready');
        }
      });
      await syncPromise;
    } catch (err) {
      if (session === sessionId) {
        console.warn('[helios-verifier] failed to initialise:', err);
        resetHelios();
      }
    } finally {
      if (session === sessionId) initPromise = null;
    }
  })();
  return initPromise;
}

export function resetHelios(): void {
  sessionId++;
  heliosProvider = null;
  isSynced = false;
  initPromise = null;
  syncPromise = null;
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
  blockTag: string,
  chainId: string,
  executionRpc: string,
): Promise<VerificationResult> {
  if (chainId.toLowerCase() !== MAINNET_CHAIN_ID) return SKIP;
  await initHelios(executionRpc);
  if (!isSynced || !heliosProvider) return SKIP;
  let heliosBalanceHex: string;
  try {
    heliosBalanceHex = (await heliosProvider.request({
      method: 'eth_call',
      params: [{ to: contractAddress, data: encodeBalanceOf(walletAddress) }, blockTag],
    })) as string;
  } catch (err) {
    console.warn('[helios-verifier] eth_call failed:', err);
    return SKIP;
  }
  const rpcValue = decodeUint256(rpcBalance);
  const heliosValue = decodeUint256(heliosBalanceHex);
  if (rpcValue === heliosValue) {
    return {
      verified: true,
      tampered: false,
      message: 'Balance verified by Helios light client.',
      provenBalance: heliosBalanceHex,
    };
  }
  console.error(`[helios-verifier] MISMATCH: RPC=${rpcValue} Helios=${heliosValue}`);
  return {
    verified: false,
    tampered: true,
    message: `Your RPC provider returned ${rpcValue.toString()} but Helios proved the real balance is ${heliosValue.toString()}. Your RPC provider may be lying.`,
    provenBalance: heliosBalanceHex,
  };
}