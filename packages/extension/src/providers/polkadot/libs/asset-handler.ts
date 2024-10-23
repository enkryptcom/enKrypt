import API from '@/providers/polkadot/libs/api';
import { SubstrateNativeToken } from '@/providers/polkadot/types/substrate-native-token';
import { SubstrateNetwork } from '@/providers/polkadot/types/substrate-network';
import { hexToString } from '@polkadot/util';

import { toBN } from 'web3-utils';
import { AssetToken, AssetTokenOptions } from './asset-token';

type AssetMetadata = {
  name: `0x${string}`;
  symbol: `0x${string}`;
  decimals: number;
};

type AssetInfo = {
  minBalance: string;
};

export default async (
  network: SubstrateNetwork,
  address: string | null,
  knownTokens?: any[],
) => {
  const api = (await network.api()) as API;

  const apiPromise = api.api;

  const metadata = await apiPromise.query.assets.metadata.entries();

  const assetMetadatas = metadata.map(([key, value]) => {
    const assetKey = (key.toHuman() as string[])[0].replaceAll(',', '');
    const assetMetadata = value.toJSON() as AssetMetadata;
    const info = {
      key: assetKey,
      name: hexToString(assetMetadata.name),
      symbol: hexToString(assetMetadata.symbol),
      decimals: assetMetadata.decimals,
    };
    return info;
  });
  const queries = assetMetadatas.map(metadata => metadata.key);
  const assetInfos = await apiPromise.query.assets.asset.multi(queries);
  const tokenOptions = assetInfos
    .map((info, index) => {
      const infoHuman = info.toHuman() as AssetInfo;
      if (infoHuman) {
        const metadata = assetMetadatas[index];
        return {
          minBalance: infoHuman.minBalance.replaceAll(',', ''),
          ...metadata,
        };
      } else {
        return null;
      }
    })
    .filter(asset => asset !== null)
    .map(asset => {
      const tokenOptions: AssetTokenOptions = {
        name: asset!.name,
        symbol: asset!.symbol,
        decimals: asset!.decimals,
        icon: network.icon,
        id: asset!.key,
        existentialDeposit: toBN(asset!.minBalance),
      };
      return tokenOptions;
    })
    .map(tokenOption => {
      if (knownTokens) {
        const knownToken = knownTokens.find(
          knownToken => knownToken.id === tokenOption.id,
        );
        if (knownToken) {
          tokenOption.coingeckoID = knownToken.coingeckoID;
          tokenOption.icon = knownToken.icon;
        }
      }
      return tokenOption;
    });
  if (address) {
    const queries = tokenOptions.map(options => {
      return [options.id, address];
    });
    const balances = await apiPromise.query.assets.account.multi(queries);
    balances.forEach((balanceInfo, index) => {
      const data: {
        balance: string;
        status?: string;
      } = balanceInfo.toJSON() as any;
      if (data) {
        tokenOptions[index].balance = data.balance.toString();
        if (data.status && data.status.toString() === 'Frozen') {
          tokenOptions[index].name = `${tokenOptions[index].name} (Frozen)`;
        }
      }
    });
  }
  const nativeAsset = new SubstrateNativeToken({
    name: network.currencyNameLong,
    symbol: network.currencyName,
    decimals: network.decimals,
    existentialDeposit: network.existentialDeposit,
    icon: network.icon,
    coingeckoID: network.coingeckoID,
  });
  return [nativeAsset, ...tokenOptions.map(o => new AssetToken(o))];
};
