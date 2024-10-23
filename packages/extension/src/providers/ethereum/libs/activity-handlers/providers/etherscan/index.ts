import cacheFetch from '@/libs/cache-fetch';
import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import {
  Activity,
  ActivityStatus,
  ActivityType,
  EthereumRawInfo,
} from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import { NetworkNames } from '@enkryptcom/types';
import { numberToHex } from 'web3-utils';
import { decodeTx } from '../../../transaction/decoder';
import { NetworkEndpoints } from './configs';
import { EtherscanTxType } from './types';
const TTL = 30000;
const getAddressActivity = async (
  address: string,
  endpoint: string,
  headers?: Record<string, string>,
): Promise<EthereumRawInfo[]> => {
  return cacheFetch(
    {
      // Note: would like to add offset=50 (i.e. results per page) but it seems to cause polygon API to hang
      url: `${endpoint}api?module=account&action=txlist&address=${address}&sort=desc`,
      headers,
    },
    TTL,
  ).then(res => {
    if (res.status === '0') return [];
    const results = res.result as EtherscanTxType[];
    const newResults = results.map(tx => {
      const rawTx: EthereumRawInfo = {
        blockHash: tx.blockHash,
        blockNumber: numberToHex(tx.blockNumber),
        contractAddress: tx.contractAddress,
        data: tx.input,
        effectiveGasPrice: numberToHex(tx.gasPrice),
        from: tx.from,
        to: tx.to === '' ? null : tx.to,
        gas: numberToHex(tx.gas),
        gasUsed: numberToHex(tx.gasUsed),
        nonce: numberToHex(tx.nonce),
        status: tx.isError === '0' ? true : false,
        transactionHash: tx.hash,
        value: numberToHex(tx.value),
        timestamp: parseInt(tx.timeStamp) * 1000,
      };
      return rawTx;
    });
    return newResults.slice(0, 50) as EthereumRawInfo[];
  });
};
export default async (
  network: BaseNetwork,
  address: string,
): Promise<Activity[]> => {
  address = address.toLowerCase();
  let headers: undefined | Record<string, string>;
  switch (network.name) {
    // OKLink Endpoints (require OKLink API key)
    case NetworkNames.XLayer:
      // api console: https://www.oklink.com/account/my-api
      // api header spec: https://www.oklink.com/docs/en/#quickstart-guide-api-authentication
      // api docs: https://www.oklink.com/docs/en/#evm-rpc-data-address-get-normal-transactions-by-address
      headers = { 'OK-ACCESS-KEY': 'df87e7eb-061f-44b1-84bc-83722fad717c' };
      break;
  }
  const enpoint =
    NetworkEndpoints[network.name as keyof typeof NetworkEndpoints];
  const activities = await getAddressActivity(address, enpoint, headers);
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
        nonce: activity.nonce,
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
