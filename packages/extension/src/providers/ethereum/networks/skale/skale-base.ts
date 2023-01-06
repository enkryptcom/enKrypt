import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetworkOptions, EvmNetwork } from "../../types/evm-network";
import { EtherscanActivity } from "../../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

import { AssetsType } from "@/types/provider";
import MarketData from "@/libs/market-data";
import { fromBase } from "@/libs/utils/units";
import BigNumber from "bignumber.js";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "@/libs/utils/number-formatter";
import API from "@/providers/ethereum/libs/api";
import Sparkline from "@/libs/sparkline";
import { NATIVE_TOKEN_ADDRESS } from "../../libs/common";
import { Erc20Token, Erc20TokenOptions } from "../../types/erc20-token";

const NATIVE_ETHC_ADDRESS_SKALE = "0xD2Aaa00700000000000000000000000000000000";
const ETH_DECIMALS = 18;

export interface SkaleParams {
  name: NetworkNames;
  name_long: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  chainID: `0x${string}`;
  node: string;
}

export function createSkaleEvmNetwork(params: SkaleParams) {
  return {
    name: params.name,
    name_long: params.name_long,
    homePage: "https://skale.space",
    blockExplorerTX: params.blockExplorerTX,
    blockExplorerAddr: params.blockExplorerAddr,
    chainID: params.chainID,
    isTestNetwork: false,
    currencyName: "SFUEL",
    currencyNameLong: "Skale FUEL",
    node: params.node,
    icon: require("../icons/skl.png"),
    gradient: "#7B3FE4",
    coingeckoID: "skale",
    coingeckoPlatform: CoingeckoPlatform.Skale,
    assetsInfoHandler: assetInfoHandlerSkale,
    activityHandler: wrapActivityHandler(EtherscanActivity),
    customTokens: true,
  } as EvmNetworkOptions;
}

export async function assetInfoHandlerSkale(
  network: EvmNetwork,
  address: string
): Promise<AssetsType[]> {
  const api = await network.api();
  const marketData = new MarketData();
  const balance = await (api as API).getBalance(address);
  const nativeAsset: AssetsType = {
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
  };

  const ethcERC20Token = new Erc20Token({
    contract: NATIVE_ETHC_ADDRESS_SKALE,
  } as Erc20TokenOptions);
  const balanceEthc = await ethcERC20Token.getLatestUserBalance(
    api as API,
    address
  );
  const nativeEthMarketData = (await marketData.getMarketData(["ethereum"]))[0];
  const nativeEthUsdBalance = new BigNumber(
    fromBase(balanceEthc, ETH_DECIMALS)
  ).times(nativeEthMarketData?.current_price ?? 0);

  const nativeETHCAsset: AssetsType = {
    name: "Ethereum Clone",
    symbol: "ETHC",
    icon: require("../icons/eth.svg"),
    balance: balanceEthc,
    balancef: formatFloatingPointValue(fromBase(balanceEthc, network.decimals))
      .value,
    balanceUSD: nativeEthUsdBalance.toNumber(),
    balanceUSDf: formatFiatValue(nativeEthUsdBalance.toString()).value,
    value: nativeEthMarketData?.current_price.toString() ?? "0",
    valuef: formatFiatValue(
      nativeEthMarketData?.current_price.toString() ?? "0"
    ).value,
    decimals: ETH_DECIMALS,
    sparkline: nativeEthMarketData
      ? new Sparkline(nativeEthMarketData.sparkline_in_7d.price, 25).dataUri
      : "",
    priceChangePercentage:
      nativeEthMarketData?.price_change_percentage_7d_in_currency ?? 0,
    contract: NATIVE_ETHC_ADDRESS_SKALE,
  };

  await Promise.all(
    network.assets.map((token) =>
      token.getLatestUserBalance(api as API, address).then((balance) => {
        token.balance = balance;
      })
    )
  );

  const assetInfos = network.assets
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

  return [nativeAsset, nativeETHCAsset, ...assetInfos];
}
