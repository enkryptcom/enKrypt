import {
  CGToken,
  SupportedNetwork,
  SupportedNetworkNames,
  TokenBalance,
} from "./types/tokenbalance-mew";
import MarketData from "@/libs/market-data";
import { toBN } from "web3-utils";
import API from "@/providers/ethereum/libs/api";
import { BaseNetwork } from "@/types/base-network";
import { EvmNetwork } from "../../types/evm-network";
import { getKnownNetworkTokens, TokenList } from "./token-lists";
import networks from "../../networks";
import { NetworkNames } from "@enkryptcom/types";
import { NATIVE_TOKEN_ADDRESS } from "../common";
import { Erc20Token } from "../../types/erc20-token";
const API_ENPOINT = "https://tokenbalance.mewapi.io/";

export default (
  network: BaseNetwork,
  address: string
): Promise<Erc20Token[]> => {
  const supportedNetworks: Record<SupportedNetworkNames, SupportedNetwork> = {
    [NetworkNames.Binance]: {
      tbName: "bsc",
      tokenurl: TokenList[NetworkNames.Binance],
      cgPlatform: networks.bsc.coingeckoID as string,
    },
    [NetworkNames.Ethereum]: {
      tbName: "eth",
      tokenurl: TokenList[NetworkNames.Ethereum],
      cgPlatform: networks.ethereum.coingeckoID as string,
    },
    [NetworkNames.Matic]: {
      tbName: "matic",
      tokenurl: TokenList[NetworkNames.Matic],
      cgPlatform: networks.matic.coingeckoID as string,
    },
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error("TOKENBALANCE-MEW: network not supported");
  const networkName = network.name as SupportedNetworkNames;
  const query = `${API_ENPOINT}${supportedNetworks[networkName].tbName}?address=${address}`;
  return fetch(query)
    .then((res) => res.json())
    .then(async (json) => {
      if (json.error) throw new Error(`TOKENBALANCE-MEW: ${json.error}`);
      else {
        const balances: Record<string, TokenBalance> = (
          json.result as TokenBalance[]
        ).reduce((obj, cur) => ({ ...obj, [cur.contract]: cur }), {});

        const marketData = new MarketData();
        const nativeMarket = await marketData.getMarketData(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [network.coingeckoID!] //it wont be null since all supported networks have coingeckoID
        );
        const marketInfo = await marketData.getMarketInfoByContracts(
          Object.keys(balances).filter(
            (contract) => contract !== NATIVE_TOKEN_ADDRESS
          ),
          supportedNetworks[networkName].cgPlatform
        );
        marketInfo[NATIVE_TOKEN_ADDRESS] = nativeMarket[0];

        const assets: Erc20Token[] = [];
        const tokenInfo: Record<string, CGToken> = await getKnownNetworkTokens(
          network.name
        );
        tokenInfo[NATIVE_TOKEN_ADDRESS] = {
          chainId: (network as EvmNetwork).chainID,
          name: network.name_long,
          decimals: 18,
          address: NATIVE_TOKEN_ADDRESS,
          logoURI: network.icon,
          symbol: network.currencyName,
        };
        const unknownTokens: string[] = [];
        let nativeAsset: Erc20Token | null = null;
        for (const [address, market] of Object.entries(marketInfo)) {
          if (market && tokenInfo[address]) {
            const asset = new Erc20Token({
              balance: toBN(balances[address].balance).toString(),
              icon: market.image,
              name: market.name,
              symbol: market.symbol,
              contract: address,
              decimals: tokenInfo[address].decimals,
              price: market.current_price.toString(),
            });
            if (address !== NATIVE_TOKEN_ADDRESS) assets.push(asset);
            else nativeAsset = asset;
          } else {
            unknownTokens.push(address);
          }
        }
        assets.unshift(nativeAsset as Erc20Token);
        if (unknownTokens.length && network.api) {
          const api = (await network.api()) as API;
          const promises = unknownTokens.map((t) => api.getTokenInfo(t));
          await Promise.all(promises).then((tokenInfo) => {
            tokenInfo.forEach((tInfo, idx) => {
              const asset = new Erc20Token({
                balance: toBN(balances[unknownTokens[idx]].balance).toString(),
                icon: nativeMarket[0]?.image || "",
                name: tInfo.name,
                symbol: tInfo.symbol,
                decimals: tInfo.decimals,
                contract: unknownTokens[idx],
              });
              assets.push(asset);
            });
          });
        }
        return assets;
      }
    });
};
