import API from "@/providers/polkadot/libs/api";
import { SubstrateNetwork } from "@/providers/polkadot/types/substrate-network";
import { hexToString, hexToBn } from "@polkadot/util";
import {
  AcalaOrmlAsset,
  AcalaOrmlAssetOptions,
  OrmlAssetType,
} from "../types/acala-orml-asset";
import { OrmlTokensAccountData } from "@acala-network/types/interfaces/types-lookup";
import { toBN } from "web3-utils";
import { KnownTokenDisplay } from "@/providers/polkadot/types";

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
  address: string,
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
        // Unhandled token types
        return null;
      }
    })
    .filter((asset) => asset !== null);

  const queries = assets.map((asset) => {
    const token = { [asset!.assetLookupId]: asset!.assetLookupValue };
    const query = [address, token];

    return query;
  });

  const tokenBalances = await apiPromise.query.tokens.accounts.multi(queries);

  const options: AcalaOrmlAssetOptions[] = tokenBalances
    .map((tokenData, index) => {
      const data = tokenData as unknown as OrmlTokensAccountData;
      const {
        name,
        symbol,
        minimalBalance,
        assetLookupId,
        assetLookupValue,
        decimals,
      } = assets[index]!;

      const existentialDeposit = minimalBalance;

      const ormlOptions: AcalaOrmlAssetOptions = {
        name: hexToString(name),
        symbol: hexToString(symbol),
        existentialDeposit,
        balance: data.free.toString(),
        assetType: assetLookupId,
        lookupValue: assetLookupValue,
        icon: network.icon,
        decimals,
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

  return options.map((o) => new AcalaOrmlAsset(o));
};
