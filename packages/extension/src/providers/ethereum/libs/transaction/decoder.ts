import { EvmNetwork } from "../../types/evm-network";
import { DecodedTx, EthereumTransaction } from "./types";
import TokenLists from "../assets-handlers/token-lists";
import cacheFetch from "@/libs/cache-fetch";
import { CGToken } from "../assets-handlers/types/tokenbalance-mew";
import { rawDecode } from "ethereumjs-abi";
import { bufferToHex } from "@enkryptcom/utils";

const transferFunc = "a9059cbb";
const ERC20Methods = [
  transferFunc, //transfer
  "23b872dd", //transferFrom
  "095ea7b3", //approve
];
const decodeDataString = (data: string): [string, string] => {
  return [data.substring(0, 10).replace("0x", ""), data.substring(10)];
};
const isTokenAction = (data: string): boolean => {
  return ERC20Methods.includes(decodeDataString(data)[0]);
};
const getTokenTransferValue = (data: string): string => {
  const decodedData = decodeDataString(data);
  console.log(decodedData);
  if (decodedData[0] === transferFunc) {
    const decoded = rawDecode(
      ["address", "uint256"],
      Buffer.from(decodedData[1], "hex")
    );
    return bufferToHex(decoded[1]);
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
  if (
    tokenValue === "0x0" &&
    tx.data &&
    tx.data !== "0x" &&
    isTokenAction(tx.data) &&
    TokenLists[network.name]
  ) {
    await cacheFetch({
      url: TokenLists[network.name],
    }).then((json) => {
      const tokens: CGToken[] = json.tokens;
      const curToken = tokens.find((t) => t.address === tx.to?.toLowerCase());
      if (curToken) {
        tokenName = curToken.name;
        tokenImage = curToken.logoURI;
        tokenDecimals = curToken.decimals;
        tokenValue = getTokenTransferValue(tx.data as string);
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
