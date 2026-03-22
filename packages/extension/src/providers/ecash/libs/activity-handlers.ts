import type { Activity, BTCRawInfo } from '@/types/activity';
import { ActivityStatus, ActivityType } from '@/types/activity';
import type { ActivityHandlerType } from '@/libs/activity-state/types';
import { ChronikAPI } from './api-chronik';
import MarketData from '@/libs/market-data';
import {
  scriptToAddress,
  extractSats,
  calculateTransactionValue,
  calculateOnchainTxFee,
  getTransactionAddresses,
  getTransactionTimestamp,
  getAddressWithoutPrefix,
} from './utils';

export const chronikHandler: ActivityHandlerType = async (
  network,
  address,
): Promise<Activity[]> => {
  try {
    const cashAddrPrefix = (network as any).cashAddrPrefix ?? 'ecash';
    const normalizedAddress = getAddressWithoutPrefix(address);

    const api = (await network.api()) as unknown as ChronikAPI;

    const txHistory = await api.getTransactionHistory(normalizedAddress);

    if (!txHistory || txHistory.length === 0) {
      return [];
    }

    let currentPrice = 0;
    if (network.coingeckoID) {
      try {
        const market = new MarketData();
        const marketData = await market.getMarketData([network.coingeckoID]);
        currentPrice = marketData[0]?.current_price ?? 0;
      } catch (priceError) {
        console.error('[chronikHandler] Error getting price:', priceError);
      }
    }

    const activities: Activity[] = [];

    for (const tx of txHistory) {
      try {
        const isReceive = tx.outputs.some((output: any) => {
          const outputAddress = scriptToAddress(
            output.outputScript,
            cashAddrPrefix,
          );
          return outputAddress === normalizedAddress;
        });

        const isSend = tx.inputs.some((input: any) => {
          const inputAddress = scriptToAddress(
            input.outputScript ?? '',
            cashAddrPrefix,
          );
          return inputAddress === normalizedAddress;
        });

        const value =
          isReceive || isSend
            ? calculateTransactionValue(
                tx.outputs,
                normalizedAddress,
                isReceive,
                cashAddrPrefix,
              )
            : '0';

        const { fromAddress, toAddress } = getTransactionAddresses(
          tx,
          normalizedAddress,
          isReceive,
          isSend,
          cashAddrPrefix,
        );

        const fee = isSend ? calculateOnchainTxFee(tx) : 0;

        const status =
          tx.block || tx.isFinal
            ? ActivityStatus.success
            : ActivityStatus.pending;

        const timestamp = getTransactionTimestamp(tx);

        const rawInfo: BTCRawInfo = {
          blockNumber: tx.block?.height || 0,
          fee,
          transactionHash: tx.txid,
          timestamp,
          inputs: tx.inputs.map((input: any) => ({
            address: scriptToAddress(input.outputScript ?? '', cashAddrPrefix),
            value: Number(extractSats(input)),
          })),
          outputs: tx.outputs.map((output: any) => ({
            address: scriptToAddress(output.outputScript, cashAddrPrefix),
            value: Number(extractSats(output)),
            pkscript: output.outputScript || '',
          })),
        };

        const tokenInfo = {
          decimals: network.decimals,
          icon: network.icon,
          symbol: network.currencyName,
          name: network.currencyNameLong,
          price: currentPrice.toString(),
        };

        const activity: Activity = {
          from: fromAddress,
          to: toAddress,
          isIncoming: isReceive,
          network: network.name,
          status,
          type: ActivityType.transaction,
          value,
          transactionHash: tx.txid,
          timestamp: timestamp * 1000,
          token: tokenInfo,
          rawInfo,
        };

        activities.push(activity);
      } catch (txError) {
        console.error(`Error parsing transaction ${tx.txid}:`, txError);
      }
    }

    activities.sort((a, b) => b.timestamp - a.timestamp);

    return activities;
  } catch (error) {
    console.error('Error in chronikHandler:', error);
    return [];
  }
};

export default chronikHandler;
