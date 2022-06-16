import { EvmNetwork } from "../../types/evm-network";
import { DecodedTx, EthereumTransaction } from "./types";
import TokenLists from "../assets-handlers/token-lists";
import cacheFetch from "@/libs/cache-fetch";
import {
  CGToken,
  SupportedNetworkNames,
} from "../assets-handlers/types/tokenbalance-mew";
import DataDecode from "./data-decoder";
import { bufferToHex } from "@enkryptcom/utils";
import type EvmApi from "../api";
import MarketData from "@/libs/market-data";
const decodeTx = async (
  tx: EthereumTransaction,
  network: EvmNetwork
): Promise<DecodedTx> => {
  const isContractCreation = tx.to ? false : true;
  let tokenName: string = network.currencyName;
  let tokenValue: string = tx.value && tx.value != "0x" ? tx.value : "0x0";
  let tokenDecimals: number = network.decimals;
  let tokenImage: string = network.icon;
  let CGToken: string | undefined = network.coingeckoID;
  let currentPriceUSD = 0;
  const marketData = new MarketData();
  const dataDecoder = new DataDecode({
    data: tx.data as string,
    to: tx.to,
    value: tx.value as string,
  });
  const setInfoFromNetwork = (): Promise<void> => {
    return (network.api() as Promise<EvmApi>).then((api) => {
      return api.getTokenInfo(tx.to as string).then((tokenInfo) => {
        tokenName = tokenInfo.name;
        tokenDecimals = tokenInfo.decimals;
        tokenValue = dataDecoder.decode().values[1];
        CGToken = undefined;
        currentPriceUSD = 0;
      });
    });
  };
  if (tokenValue === "0x0" && dataDecoder.isTokenAction) {
    if (TokenLists[network.name as SupportedNetworkNames]) {
      await cacheFetch({
        url: TokenLists[network.name as SupportedNetworkNames],
      }).then((json) => {
        const tokens: CGToken[] = json.tokens;
        const curToken = tokens.find((t) => t.address === tx.to?.toLowerCase());
        if (curToken) {
          tokenName = curToken.name;
          tokenImage = curToken.logoURI;
          tokenDecimals = curToken.decimals;
          tokenValue = dataDecoder.decode().values[1];
          return marketData
            .getMarketInfoByContracts([tx.to!], network.coingeckoID!)
            .then((marketInfo) => {
              if (marketInfo[tx.to!]) {
                currentPriceUSD = marketInfo[tx.to!]!.current_price;
                CGToken = marketInfo[tx.to!]!.id;
              }
            });
        } else {
          return setInfoFromNetwork();
        }
      });
    } else {
      await setInfoFromNetwork();
    }
  }
  if (CGToken === network.coingeckoID && network.coingeckoID) {
    await marketData.getMarketData([CGToken!]).then((marketInfo) => {
      currentPriceUSD = marketInfo[0]!.current_price;
    });
  }
  return {
    isContractCreation,
    dataHex: bufferToHex(dataDecoder.data),
    toAddress: tx.to,
    decodedHex: dataDecoder.decode().values,
    tokenDecimals,
    tokenImage,
    tokenName,
    tokenValue,
    currentPriceUSD,
  };
};

export { decodeTx };
