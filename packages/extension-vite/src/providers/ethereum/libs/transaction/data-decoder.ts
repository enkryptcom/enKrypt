import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { isHexStrict, toHex } from "web3-utils";
import { rawDecode } from "ethereumjs-abi";
import { DataDecodeResponse } from "./types";
import funcSigs from "./lists/4bytes";
import tokenSigs from "./lists/tokenSigs";
const getParams = (functionName: string): string[] => {
  const regExp = /\(([^)]+)\)/;
  const params = regExp.exec(functionName);
  if (!params || params?.length < 1) return [];
  return params[1].split(",");
};
class DataDecode {
  data: Buffer;
  readonly functionSig: string;
  readonly valueData: string;
  readonly isTokenAction: boolean;
  readonly value: string;
  readonly to?: string;
  constructor({
    data = "0x",
    value = "0x0",
    to,
  }: {
    data: string;
    value: string;
    to?: string;
  }) {
    if (!isHexStrict(data)) throw new Error("data-decoder: not a valid hex");
    this.data = hexToBuffer(data);
    this.functionSig = bufferToHex(this.data.slice(0, 4));
    this.valueData = bufferToHex(this.data.slice(4));
    this.isTokenAction = Object.values(tokenSigs).includes(this.functionSig);
    this.value = value;
    this.to = to;
  }
  decode(): DataDecodeResponse {
    const sig = funcSigs[this.functionSig];
    if (!sig)
      return {
        decoded: false,
        values: [bufferToHex(this.data)],
        isToken: this.isTokenAction,
      };
    try {
      const params = getParams(sig[0]);
      const decoded = rawDecode(params, hexToBuffer(this.valueData));
      const decodedData: DataDecodeResponse = {
        decoded: true,
        values: decoded.map((a) => toHex(a)),
        function: sig[0],
        isToken: this.isTokenAction,
      };
      if (this.functionSig === tokenSigs.transfer) {
        decodedData.tokenValue = decodedData.values[1];
        decodedData.tokenTo = decodedData.values[0];
      } else if (this.functionSig === tokenSigs.transferFrom) {
        decodedData.tokenValue = decodedData.values[2];
        decodedData.tokenTo = decodedData.values[1];
      }
      return decodedData;
    } catch (e) {
      return {
        decoded: false,
        values: [bufferToHex(this.data)],
        function: sig[0],
        isToken: this.isTokenAction,
      };
    }
  }
}

export default DataDecode;
