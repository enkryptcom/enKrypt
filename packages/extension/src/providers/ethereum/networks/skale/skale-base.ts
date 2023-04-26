import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetworkOptions, EvmNetwork } from "../../types/evm-network";
import { EtherscanActivity } from "../../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

import { AssetsType } from "@/types/provider";
import MarketData from "@/libs/market-data";
import { fromBase } from "@enkryptcom/utils";
import BigNumber from "bignumber.js";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "@/libs/utils/number-formatter";
import API from "@/providers/ethereum/libs/api";
import Sparkline from "@/libs/sparkline";
import { NATIVE_TOKEN_ADDRESS } from "../../libs/common";
import { Erc20Token, Erc20TokenOptions } from "../../types/erc20-token";
const DEFAULT_DECIMALS = 18;

function getBlockExplorerValue(
  chainName: string,
  isTestNetwork: boolean,
  type: "tx" | "address" | string
) {
  return (
    "https://" +
    `${chainName}` +
    ".explorer." +
    `${isTestNetwork ? "staging-v3" : "mainnet"}` +
    ".skalenodes.com/" +
    `${type}` +
    "/[[" +
    `${type === "tx" ? "txHash" : type}` +
    "]]"
  );
}

export interface ICustomSKALEAsset {
  address: string;
  coingeckoID: string;
  name?: string;
  symbol?: string;
  icon?: string;
  showZero?: boolean;
  decimals?: number;
}

export interface SkaleParams {
  name: NetworkNames;
  name_long: string;
  chainName: string;
  chainID: `0x${string}`;
  isTestNetwork?: boolean;
  icon?: string;
  currencyName?: string;
  currencyNameLong?: string;
}

async function nativeAsset(
  network: EvmNetwork,
  address: string
): Promise<AssetsType> {
  const api = await network.api();
  const balance = await (api as API).getBalance(address);
  return {
    name: network.currencyNameLong,
    symbol: network.currencyName,
    icon: require("../icons/skl-fuel.png"),
    balance,
    balancef: formatFloatingPointValue(fromBase(balance, network.decimals))
      .value,
    balanceUSD: 0,
    balanceUSDf: "0",
    value: "0",
    valuef: "0",
    decimals: network.decimals,
    sparkline: "",
    priceChangePercentage: 0,
    contract: NATIVE_TOKEN_ADDRESS,
  } as AssetsType;
}

async function assetInfos(
  network: EvmNetwork,
  address: string
): Promise<AssetsType[]> {
  const api = await network.api();

  await Promise.all(
    network.assets.map((token) =>
      token.getLatestUserBalance(api as API, address).then((balance) => {
        token.balance = balance;
      })
    )
  );

  return network.assets
    .map((token) => {
      const assetsType: AssetsType = {
        name: token.name,
        symbol: token.symbol,
        icon: token.icon,
        balance: token.balance!,
        balancef: formatFloatingPointValue(
          fromBase(token.balance!, token.decimals)
        ).value,
        balanceUSD: 0,
        balanceUSDf: "0",
        value: "0",
        valuef: "0",
        decimals: token.decimals,
        sparkline: "",
        priceChangePercentage: 0,
        contract: token.contract,
      };
      return assetsType;
    })
    .filter((asset) => asset.balancef !== "0");
}

async function getPreconfiguredTokens(
  api: API,
  assets: ICustomSKALEAsset[],
  address: string
): Promise<AssetsType[]> {
  const marketData = new MarketData();
  const preconfiguredAssets: AssetsType[] = [];
  const nativeAssetMarketData = await marketData.getMarketData(
    assets.map((asset) => asset.coingeckoID)
  );
  for (let index = 0; index < assets.length; index++) {
    const asset = assets[index];
    const assetToken = new Erc20Token({
      contract: asset.address,
    } as Erc20TokenOptions);
    const balanceAsset = await assetToken.getLatestUserBalance(
      api as API,
      address
    );
    const assetDecimals = asset.decimals ? asset.decimals : DEFAULT_DECIMALS;
    const nativeAssetUsdBalance = new BigNumber(
      fromBase(balanceAsset, assetDecimals)
    ).times(nativeAssetMarketData[index]?.current_price ?? 0);

    const assetData: AssetsType = {
      name: asset?.name ?? nativeAssetMarketData[index]?.name ?? "Name",
      symbol: asset?.symbol ?? nativeAssetMarketData[index]?.symbol ?? "Symbol",
      icon:
        nativeAssetMarketData[index]?.image ??
        require(`../icons/${asset.icon}`) ??
        require("../icons/skl.png"),
      balance: balanceAsset,
      balancef: formatFloatingPointValue(fromBase(balanceAsset, assetDecimals))
        .value,
      balanceUSD: nativeAssetUsdBalance.toNumber(),
      balanceUSDf: formatFiatValue(nativeAssetUsdBalance.toString()).value,
      value: nativeAssetMarketData[index]?.current_price.toString() ?? "0",
      valuef: formatFiatValue(
        nativeAssetMarketData[index]?.current_price.toString() ?? "0"
      ).value,
      decimals: assetDecimals,
      sparkline: nativeAssetMarketData[index]
        ? new Sparkline(nativeAssetMarketData[index]?.sparkline_in_7d.price, 25)
            .dataValues
        : "",
      priceChangePercentage:
        nativeAssetMarketData[index]?.price_change_percentage_7d_in_currency ??
        0,
      contract: asset.address,
    };
    if (asset.showZero || assetData.balancef !== "0")
      preconfiguredAssets.push(assetData);
  }
  return preconfiguredAssets;
}

function getAssetHandler(
  inputAssets?: ICustomSKALEAsset[]
): (network: EvmNetwork, address: string) => Promise<AssetsType[]> {
  return async function (network, address) {
    if (!inputAssets || inputAssets.length === 0) {
      return [
        await nativeAsset(network, address),
        ...(await assetInfos(network, address)),
      ];
    }
    const api = await network.api();
    const assets: ICustomSKALEAsset[] = inputAssets;
    const preconfiguredAssets: AssetsType[] = await getPreconfiguredTokens(
      api as API,
      assets,
      address
    );
    return [
      await nativeAsset(network, address),
      ...preconfiguredAssets,
      ...(await assetInfos(network, address)),
    ];
  };
}

export function createSkaleEvmNetwork(
  params: SkaleParams,
  assets?: ICustomSKALEAsset[]
): EvmNetwork {
  return new EvmNetwork({
    name: params.name,
    name_long: params.name_long,
    homePage: "https://skale.space",
    blockExplorerTX: getBlockExplorerValue(
      params.chainName,
      params.isTestNetwork ?? false,
      "tx"
    ),
    blockExplorerAddr: getBlockExplorerValue(
      params.chainName,
      params.isTestNetwork ?? false,
      "address"
    ),
    chainID: params.chainID,
    isTestNetwork: params.isTestNetwork ?? false,
    currencyName: params.currencyName ?? "sFUEL",
    currencyNameLong: params.currencyNameLong ?? "SKALE FUEL",
    node: `wss://${
      params.isTestNetwork ? "staging-v3" : "mainnet"
    }.skalenodes.com/v1/ws/${params.chainName}`,
    icon: require(`../icons/${params.icon ?? "skl.png"}`),
    gradient: "#7B3FE4",
    coingeckoID: "skale",
    coingeckoPlatform: CoingeckoPlatform.SKALE,
    assetsInfoHandler: getAssetHandler(assets),
    activityHandler: wrapActivityHandler(EtherscanActivity),
    customTokens: true,
  } as EvmNetworkOptions);
}
