import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import { numberToHex } from 'web3-utils';
import {
  Activity,
  ActivityStatus,
  ActivityType,
  EthereumRawInfo,
} from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import { decodeTx } from '../../../transaction/decoder';
import { NetworkEndpoints } from './configs';
import { RoutescanTxType } from './types';

const getAddressActivity = async (
  address: string,
  endpoint: string,
  chainId: string,
): Promise<EthereumRawInfo[]> => {
  const limit = 50;
  const decimalChainId = parseInt(chainId, 16);
  const url = `${endpoint}/api/evm/all/transactions?includedChainIds=${decimalChainId}&limit=${limit}&sort=desc&fromAddresses=${address}&toAddresses=${address}`;
  const response = await fetch(url);
  if (!response.ok || response.status === 202) return [];
  const res = await response.json();
  if (!res.items) return [];

  const results = res.items as RoutescanTxType[];
  const newResults = results.map(tx => {
    const rawTx: EthereumRawInfo = {
      blockHash: tx.blockHash,
      blockNumber: numberToHex(tx.blockNumber),
      contractAddress: tx.to?.isContract ? tx.to.id : '',
      data: '0x0',
      effectiveGasPrice: numberToHex(tx.gasPrice),
      from: tx.from.id,
      to: tx.to?.id === '' ? null : tx.to?.id,
      gas: numberToHex(tx.gasLimit),
      gasUsed: numberToHex(tx.gasUsed),
      nonce: numberToHex(tx.txIndex),
      status: tx.status,
      transactionHash: tx.txHash,
      value: numberToHex(tx.value),
      timestamp: new Date(tx.timestamp).getTime(),
    };
    return rawTx;
  });
  return newResults.slice(0, limit) as EthereumRawInfo[];
};

export default async (
  network: BaseNetwork,
  address: string,
): Promise<Activity[]> => {
  address = address.toLowerCase();
  const endpoint =
    NetworkEndpoints[network.name as keyof typeof NetworkEndpoints];
  const chainId = (network as EvmNetwork).chainID.replace('0x', '');
  const activities = await getAddressActivity(address, endpoint, chainId);
  const Promises = activities.map(activity => {
    return decodeTx(activity, network as EvmNetwork).then(txData => {
      return {
        from: activity.from,
        to: activity.contractAddress
          ? activity.contractAddress
          : txData.tokenTo!,
        isIncoming: activity.from !== address,
        network: network.name,
        rawInfo: activity,
        status: activity.status
          ? ActivityStatus.success
          : ActivityStatus.failed,
        timestamp: activity.timestamp ? activity.timestamp : 0,
        value: txData.tokenValue,
        transactionHash: activity.transactionHash,
        type: ActivityType.transaction,
        token: {
          decimals: txData.tokenDecimals,
          icon: txData.tokenImage,
          name: txData.tokenName,
          symbol: txData.tokenSymbol,
          price: txData.currentPriceUSD.toString(),
        },
      };
    });
  });
  return Promise.all(Promises);
};
