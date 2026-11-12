import BigNumber from 'bignumber.js';
import { FullTransactionModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { firoElectrum } from '@/providers/bitcoin/libs/electrum-client/electrum-client';
import { base64ToReversedHex } from '@/libs/spark-handler/utils';
import SparkHistoryState from '@/libs/utils/spark-history-state';
import { getSparkHistoryOptions } from '@/libs/utils/spark-history';
import { SyncedSparkCoin } from '@/libs/utils/updateAndSync/markCoinsAsUsed';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';

export type SparkHistoryEntry = {
  txid: string;
  isIncoming: boolean;
  // Base units of this wallet's own coins spent and created by the tx.
  spent: BigNumber;
  created: BigNumber;
};

type RebuildSparkHistoryOptions = {
  coins: SyncedSparkCoin[];
  network: BaseNetwork;
  sparkAddress?: string;
};

export const HIDDEN_SPARK_ADDRESS = 'Hidden';

const sparkHistoryState = new SparkHistoryState();

let isRebuilding = false;
let queuedRebuild: RebuildSparkHistoryOptions | null = null;

const decodeTxid = (base64?: string | null): string | null => {
  if (!base64) return null;
  try {
    return base64ToReversedHex(base64);
  } catch {
    return null;
  }
};

const addTo = (map: Map<string, BigNumber>, txid: string, value: BigNumber) =>
  map.set(txid, (map.get(txid) ?? new BigNumber(0)).plus(value));

// Electrum returns tx amounts in whole FIRO (e.g. 0.00009428).
const toBaseUnits = (value: number | undefined, decimals: number) =>
  new BigNumber(value ?? 0)
    .shiftedBy(decimals)
    .integerValue(BigNumber.ROUND_HALF_UP);

export const getEntrySignature = (entry: SparkHistoryEntry): string =>
  `${entry.isIncoming ? 'in' : 'out'}:${entry.spent.toFixed(0)}:${entry.created.toFixed(0)}`;

export const classifySparkHistory = (
  coins: SyncedSparkCoin[],
): SparkHistoryEntry[] => {
  const spentIn = new Map<string, BigNumber>();
  const createdIn = new Map<string, BigNumber>();

  coins.forEach(coin => {
    const value = new BigNumber(String(coin.value ?? 0));
    if (!value.isFinite()) return;

    // Skip just this coin; a bad id must not shift the values of the others.
    const createdTxid = decodeTxid(coin.coin?.[1]);
    if (createdTxid) addTo(createdIn, createdTxid, value);

    const spentTxid = coin.isUsed ? decodeTxid(coin.txHash) : null;
    if (spentTxid) addTo(spentIn, spentTxid, value);
  });

  const sends = [...spentIn].map(([txid, spent]) => ({
    txid,
    isIncoming: false,
    spent,
    // Coins this wallet got back from its own send are the change.
    created: createdIn.get(txid) ?? new BigNumber(0),
  }));
  const receives = [...createdIn]
    .filter(([txid]) => !spentIn.has(txid))
    .map(([txid, created]) => ({
      txid,
      isIncoming: true,
      spent: new BigNumber(0),
      created,
    }));

  return [...sends, ...receives];
};

const getSentValue = (
  entry: SparkHistoryEntry,
  tx: FullTransactionModel,
  decimals: number,
): { to: string | null; value: BigNumber } => {
  const transparentOuts = (tx.vout ?? []).filter(
    out => out.scriptPubKey?.addresses?.length,
  );
  // Outputs to a transparent address are public, so the amount is exact.
  if (transparentOuts.length) {
    return {
      to: transparentOuts[0]?.scriptPubKey?.addresses?.[0] ?? null,
      value: transparentOuts.reduce(
        (sum, out) => sum.plus(toBaseUnits(out.value, decimals)),
        new BigNumber(0),
      ),
    };
  }

  const fee = (tx.vin ?? []).reduce(
    (sum, input) => sum.plus(toBaseUnits(input.nFees, decimals)),
    new BigNumber(0),
  );
  const spentMinusChange = entry.spent.minus(entry.created);
  const value = spentMinusChange.minus(fee);
  // A send to this wallet's own Spark address only costs the fee.
  return { to: null, value: value.gt(0) ? value : spentMinusChange };
};

const getTransparentSender = (tx: FullTransactionModel): string | undefined =>
  (tx.vin ?? []).find(input => input.address)?.address ??
  (tx.vin ?? []).find(input => input.addresses?.length)?.addresses[0];

export const buildSparkActivity = (
  entry: SparkHistoryEntry,
  tx: FullTransactionModel,
  network: BaseNetwork,
  sparkAddress?: string,
): Activity => {
  const ownAddress = sparkAddress ?? HIDDEN_SPARK_ADDRESS;
  const isConfirmed = (tx.height ?? 0) > 0;

  let from = ownAddress;
  let to = ownAddress;
  let value = entry.created;

  if (entry.isIncoming) {
    from = getTransparentSender(tx) ?? HIDDEN_SPARK_ADDRESS;
  } else {
    const sent = getSentValue(entry, tx, network.decimals);
    to = sent.to ?? HIDDEN_SPARK_ADDRESS;
    value = sent.value;
  }

  return {
    network: network.name,
    from,
    to,
    isIncoming: entry.isIncoming,
    status: isConfirmed ? ActivityStatus.success : ActivityStatus.pending,
    timestamp: tx.time ? tx.time * 1000 : Date.now(),
    type: ActivityType.transaction,
    value: value.toFixed(0),
    transactionHash: entry.txid,
    token: {
      icon: network.icon,
      symbol: network.currencyName,
      name: network.currencyName,
      decimals: network.decimals,
    },
  };
};

const fetchTxs = async (
  txids: string[],
): Promise<Record<string, FullTransactionModel>> => {
  try {
    return await firoElectrum.multiGetTransactionByTxid(txids);
  } catch {
    // One tx the server does not know fails the whole batch; fetch them one
    // by one so it cannot hold back the rest of the history.
    const results = await Promise.allSettled(
      txids.map(txid => firoElectrum.multiGetTransactionByTxid([txid])),
    );
    return results.reduce<Record<string, FullTransactionModel>>(
      (txs, result) =>
        result.status === 'fulfilled' ? { ...txs, ...result.value } : txs,
      {},
    );
  }
};

const runRebuild = async ({
  coins,
  network,
  sparkAddress,
}: RebuildSparkHistoryOptions): Promise<void> => {
  const entries = classifySparkHistory(coins);
  if (!entries.length) return;

  const options = getSparkHistoryOptions(network.name);
  const [saved, signatures] = await Promise.all([
    sparkHistoryState.getAllActivities(options),
    sparkHistoryState.getSyncedSignatures(options),
  ]);
  const savedByTxid = new Map(saved.map(act => [act.transactionHash, act]));

  // Confirmed rows whose coins did not change are already right; only fetch
  // the rest so later syncs stay cheap.
  const toFetch = entries.filter(entry => {
    const savedRow = savedByTxid.get(entry.txid);
    // Rebuilt before and only pushed out by the 500 entry limit.
    if (!savedRow) return signatures[entry.txid] !== getEntrySignature(entry);
    if (savedRow.status !== ActivityStatus.success) return true;
    const isSyncRow =
      savedRow.type === ActivityType.spark_transaction ||
      entry.txid in signatures;
    return isSyncRow && signatures[entry.txid] !== getEntrySignature(entry);
  });
  if (!toFetch.length) return;

  const txs = await fetchTxs(toFetch.map(entry => entry.txid));

  const rows: Activity[] = [];
  const newSignatures: Record<string, string> = {};
  toFetch.forEach(entry => {
    const tx = txs[entry.txid];
    // Not fetched this time; the next sync tries again.
    if (!tx) return;
    rows.push(buildSparkActivity(entry, tx, network, sparkAddress));
    newSignatures[entry.txid] = getEntrySignature(entry);
  });
  if (!rows.length) return;

  await sparkHistoryState.upsertSyncedActivities(rows, newSignatures, options);
};

export const rebuildSparkHistory = async (
  options: RebuildSparkHistoryOptions,
): Promise<void> => {
  // A sync finished while the last rebuild was still running; redo it once
  // with the newest coins when that one is done.
  if (isRebuilding) {
    queuedRebuild = options;
    return;
  }

  isRebuilding = true;
  try {
    await runRebuild(options);
  } catch (error) {
    console.error('Failed to rebuild Spark history', error);
  } finally {
    isRebuilding = false;
  }

  const next = queuedRebuild;
  queuedRebuild = null;
  if (next) await rebuildSparkHistory(next);
};
