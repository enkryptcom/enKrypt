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

const decodeTx = async (
  tx: EthereumTransaction,
  network: EvmNetwork
): Promise<DecodedTx> => {
  const isContractCreation = tx.to ? false : true;
  let tokenName: string = network.currencyName;
  let tokenValue: string = tx.value && tx.value != "0x" ? tx.value : "0x0";
  let tokenDecimals: number = network.decimals;
  let tokenImage: string = network.icon;
  const dataDecoder = new DataDecode({
    data: tx.data as string,
    to: tx.to,
    value: tx.value as string,
  });
  if (
    tokenValue === "0x0" &&
    dataDecoder.isTokenAction &&
    TokenLists[network.name as SupportedNetworkNames]
  ) {
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
      }
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
  };
};

export { decodeTx };
