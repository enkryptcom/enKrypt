import { EvmNetwork } from "../../types/evm-network";
import { DecodedTx, EthereumTransaction } from "./types";
import {
  getKnownNetworkTokens,
  TokenList,
} from "../assets-handlers/token-lists";
import { SupportedNetworkNames } from "../assets-handlers/types/tokenbalance-mew";
import DataDecode from "./data-decoder";
import { bufferToHex } from "@enkryptcom/utils";
import type EvmApi from "../api";
import MarketData from "@/libs/market-data";
import { EthereumRawInfo } from "@/types/activity";
const decodeTx = async (
  tx: EthereumTransaction | EthereumRawInfo,
  network: EvmNetwork
): Promise<DecodedTx> => {
  const isContractCreation = tx.to ? false : true;
  let tokenTo = tx.to || null;
  let tokenName: string = network.currencyName;
  let tokenValue: string = tx.value && tx.value != "0x" ? tx.value : "0x0";
  let tokenDecimals: number = network.decimals;
  let tokenImage: string = network.icon;
  let tokenSymbol: string = network.currencyName;
  let CGToken: string | undefined = network.coingeckoID;
  let currentPriceUSD = 0;
  const marketData = new MarketData();
  const dataDecoder = new DataDecode({
    data: tx.data as string,
    to: tx.to!,
    value: tx.value as string,
  });
  const setInfoFromNetwork = (): Promise<void> => {
    return (network.api() as Promise<EvmApi>).then((api) => {
      return api.getTokenInfo(tx.to as string).then((tokenInfo) => {
        tokenName = tokenInfo.name;
        tokenDecimals = tokenInfo.decimals;
        tokenSymbol = tokenInfo.symbol;
        const decodedInfo = dataDecoder.decode();
        if (decodedInfo.tokenValue) {
          tokenValue = decodedInfo.tokenValue;
          tokenTo = decodedInfo.tokenTo!;
        }
        CGToken = undefined;
        currentPriceUSD = 0;
      });
    });
  };
  if (tokenValue === "0x0" && dataDecoder.isTokenAction) {
    if (TokenList[network.name as SupportedNetworkNames]) {
      const knownTokens = await getKnownNetworkTokens(network.name);
      const curToken = knownTokens[tx.to?.toLowerCase() || ""];
      if (curToken) {
        tokenName = curToken.name;
        tokenImage = curToken.logoURI;
        tokenDecimals = curToken.decimals;
        tokenSymbol = curToken.symbol;
        const decodedInfo = dataDecoder.decode();
        if (decodedInfo.tokenValue) {
          tokenValue = decodedInfo.tokenValue;
          tokenTo = decodedInfo.tokenTo!;
        }
        await marketData
          .getMarketInfoByContracts([tx.to!], network.coingeckoPlatform!)
          .then((marketInfo) => {
            if (marketInfo[tx.to!]) {
              currentPriceUSD = marketInfo[tx.to!]!.current_price;
              CGToken = marketInfo[tx.to!]!.id;
            }
          });
      } else {
        await setInfoFromNetwork();
      }
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
    toAddress: tx.to!,
    decodedHex: dataDecoder.decode().values,
    decoded: dataDecoder.decode().decoded,
    tokenDecimals,
    tokenImage,
    tokenName,
    tokenValue,
    tokenSymbol,
    tokenTo,
    currentPriceUSD,
  };
};

export { decodeTx };
