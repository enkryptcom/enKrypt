import API from "@/providers/polkadot/libs/api";
import { SubstrateNetwork } from "@/providers/polkadot/types/substrate-network";
import { hexToString, hexToBn } from "@polkadot/util";
import {
  BifrostOrmlAsset,
  BifrostOrmlAssetOptions,
  OrmlAssetType,
} from "../types/bifrost-orml-asset";
import { OrmlTokensAccountData } from "../../acala/types/acala-orml-asset";
import { toBN } from "web3-utils";
import { KnownTokenDisplay } from "@/providers/polkadot/types";
import { SubstrateNativeToken } from "@/providers/polkadot/types/substrate-native-token";

type AssetMetadata = {
  name: `0x${string}`;
  symbol: `0x${string}`;
  decimals: number;
  minimalBalance: number | `0x${string}`;
};

type NativeAsset = Record<string, string>;

type ForeignAsset = string;

type StableAsset = string;

type Erc20 = string;

enum AssetIds {
  NATIVE_ASSET = "NativeAssetId",
  FOREIGN_ASSET = "ForeignAssetId",
  STABLE_ASSET = "StableAssetId",
  ERC20_ASSET = "Erc20",
}

type AssetKey = Record<
  AssetIds,
  NativeAsset | ForeignAsset | StableAsset | Erc20
>;

export default async (
  network: SubstrateNetwork,
  address: string | null,
  knownTokens?: KnownTokenDisplay[]
) => {
  const api = (await network.api()) as API;

  const apiPromise = api.api;

  const metadata =
    await apiPromise.query.assetRegistry.assetMetadatas.entries();

  const assets = metadata
    .map(([key, value]) => {
      const assetKey = (key.toHuman() as [AssetKey])[0];
      const assetMetadata = value.toJSON() as AssetMetadata;
      const decimals = assetMetadata.decimals;
      const minimalBalance =
        typeof assetMetadata.minimalBalance === "string"
          ? hexToBn(assetMetadata.minimalBalance)
          : toBN(assetMetadata.minimalBalance);

      let assetLookupId: OrmlAssetType | null = null;
      let assetLookupValue: string | null = null;

      if (assetKey[AssetIds.FOREIGN_ASSET]) {
        assetLookupId = "foreignAsset";
        assetLookupValue = assetKey[AssetIds.FOREIGN_ASSET] as string;
      } else if (assetKey[AssetIds.NATIVE_ASSET]) {
        assetLookupId = Object.keys(
          assetKey[AssetIds.NATIVE_ASSET]
        )[0] as "token";

        assetLookupValue = (assetKey[AssetIds.NATIVE_ASSET] as NativeAsset)[
          assetLookupId
        ] as string;
      } else if (assetKey[AssetIds.STABLE_ASSET]) {
        assetLookupId = "stableAssetPoolToken";
        assetLookupValue = assetKey[AssetIds.STABLE_ASSET] as string;
      } else if (assetKey[AssetIds.ERC20_ASSET]) {
        // TODO add Erc20 support, required special RPC call
      }

      if (assetLookupId && assetLookupValue) {
        const assetInfo = {
          name: assetMetadata.name,
          symbol: assetMetadata.symbol,
          decimals,
          minimalBalance,
          assetLookupId,
          assetLookupValue,
        };

        return assetInfo;
      } else {
        // Unhandled token types, right now just Erc20
        return null;
      }
    })
    .filter((asset) => asset !== null);

  const tokenOptions: BifrostOrmlAssetOptions[] = assets
    .map((asset) => {
      const ormlOptions: BifrostOrmlAssetOptions = {
        name: hexToString(asset!.name),
        symbol: hexToString(asset!.symbol),
        existentialDeposit: asset!.minimalBalance,
        assetType: asset!.assetLookupId,
        lookupValue: asset!.assetLookupValue,
        icon: network.icon,
        decimals: asset!.decimals,
      };

      return ormlOptions;
    })
    .map((tokenOptions) => {
      if (knownTokens) {
        const knownToken = knownTokens.find(
          (knownToken) =>
            knownToken.name === tokenOptions.name &&
            knownToken.symbol === tokenOptions.symbol
        );

        if (knownToken) {
          tokenOptions.coingeckoID = knownToken.coingeckoID;
          tokenOptions.icon = knownToken.icon;
        }
      }
      return tokenOptions;
    });

  const nativeAsset = new SubstrateNativeToken({
    name: network.currencyNameLong,
    symbol: network.name,
    decimals: network.decimals,
    existentialDeposit: network.existentialDeposit,
    icon: network.icon,
    coingeckoID: network.coingeckoID,
  });

  if (address) {
    await nativeAsset.getLatestUserBalance(apiPromise, address);
    const queries = tokenOptions.map((asset) => {
      const token = { [asset.assetType]: asset.lookupValue };
      const query = [address, token];

      return query;
    });

    const tokenBalances = await apiPromise.query.tokens.accounts.multi(queries);

    tokenBalances.forEach((tokenData, index) => {
      const data = tokenData as unknown as OrmlTokensAccountData;

      tokenOptions[index].balance = data.free.toString();
    });
  }

  return [nativeAsset, ...tokenOptions.map((o) => new BifrostOrmlAsset(o))];
};
