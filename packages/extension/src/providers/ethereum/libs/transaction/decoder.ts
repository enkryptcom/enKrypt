import { EvmNetwork } from "../../types/evm-network";
import { DecodedTx, EthereumTransaction } from "./types";
import TokenLists from "../assets-handlers/token-lists";
import cacheFetch from "@/libs/cache-fetch";
import {
  CGToken,
  SupportedNetworkNames,
} from "../assets-handlers/types/tokenbalance-mew";
import tokenSigs from "./lists/tokenSigs";
import DataDecode from "./data-decoder";
import { numberToHex } from "web3-utils";

const getTokenTransferValue = (data: DataDecode): string => {
  if (data.functionSig === tokenSigs.transfer) {
    const decoded = data.decode();
    return numberToHex(decoded.values[1]);
  } else if (data.functionSig === tokenSigs.transferFrom) {
    const decoded = data.decode();
    return numberToHex(decoded.values[2]);
  }
  return "0x0";
};
const decodeTx = async (
  tx: EthereumTransaction,
  network: EvmNetwork
): Promise<DecodedTx> => {
  const isContractCreation = tx.to ? false : true;
  let tokenName: string = network.currencyName;
  let tokenValue: string = tx.value && tx.value != "0x" ? tx.value : "0x0";
  let tokenDecimals: number = network.decimals;
  let tokenImage: string = network.icon;
  const dataDecoder = new DataDecode(tx.data || "0x");
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
        tokenValue = getTokenTransferValue(dataDecoder);
      }
    });
  }
  return {
    isContractCreation,
    dataHex: tx.data ? tx.data : "0x",
    toAddress: tx.to,
    decodedHex: [],
    tokenDecimals,
    tokenImage,
    tokenName,
    tokenValue,
  };
};

export { decodeTx };
