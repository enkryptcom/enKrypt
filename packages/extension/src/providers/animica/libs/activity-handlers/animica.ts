import MarketData from '@/libs/market-data';
import { ActivityHandlerType } from '@/libs/activity-state/types';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import { AnimicaNetwork } from '../../networks/animica-base';

/** `GET {explorerApi}/address/{address}` */
interface ExplorerTx {
  hash: string;
  from: string;
  to: string;
  /** nANM, decimal string */
  value: string;
  status: string;
  blockNumber: number;
  /** unix seconds */
  timestamp: number;
  classification?: { type: string; failed: boolean };
}

interface ExplorerAddressResponse {
  address: string;
  txs: ExplorerTx[];
}

const toActivityStatus = (tx: ExplorerTx): ActivityStatus => {
  if (tx.classification?.failed) return ActivityStatus.failed;
  if (tx.status === 'confirmed' || tx.status === 'finalized') {
    return ActivityStatus.success;
  }
  return ActivityStatus.pending;
};

const AnimicaActivity: ActivityHandlerType = async (
  network: BaseNetwork,
  address: string,
): Promise<Activity[]> => {
  try {
    const { explorerApi } = network as AnimicaNetwork;
    const response = await fetch(`${explorerApi}/address/${address}`);
    if (!response.ok) return [];
    const { txs } = (await response.json()) as ExplorerAddressResponse;
    if (!Array.isArray(txs)) return [];

    let tokenPrice = '0';
    if (network.coingeckoID) {
      const marketData = new MarketData();
      await marketData
        .getTokenPrice(network.coingeckoID)
        .then(price => (tokenPrice = price || '0'));
    }

    return txs.map(tx => ({
      from: tx.from,
      to: tx.to,
      isIncoming: tx.from !== address,
      network: network.name,
      status: toActivityStatus(tx),
      timestamp: tx.timestamp * 1000,
      token: {
        decimals: network.decimals,
        icon: network.icon,
        name: network.name_long,
        symbol: network.currencyName,
        price: tokenPrice,
      },
      transactionHash: tx.hash,
      type: ActivityType.transaction,
      value: tx.value,
    }));
  } catch (error) {
    console.error('Error fetching Animica activities:', error);
    return [];
  }
};

export default AnimicaActivity;
