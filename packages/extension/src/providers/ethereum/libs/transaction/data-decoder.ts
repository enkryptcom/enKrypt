import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { isHexStrict } from "web3-utils";
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
  constructor(data: string) {
    if (!isHexStrict(data)) throw new Error("data-decoder: not a valid hex");
    this.data = hexToBuffer(data);
    this.functionSig = bufferToHex(this.data.slice(0, 4));
    this.valueData = bufferToHex(this.data.slice(4));
    this.isTokenAction = Object.values(tokenSigs).includes(this.functionSig);
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
      return {
        decoded: true,
        values: decoded,
        function: sig[0],
        isToken: this.isTokenAction,
      };
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
