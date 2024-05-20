import BN from "bn.js";

export const isHex = (hex: string) =>
  (typeof hex === "string" || typeof hex === "number") &&
  /^(-0x|0x)?[0-9a-f]*$/i.test(hex);

export const stripHexPrefix = (str: string) => {
  if (isHex(str)) return str.replace(/^(-)?0x/i, "$1");
  return str;
};

// https://github.com/SilentCicero/number-to-bn/blob/master/src/index.js
/**
 * Returns a BN object, converts a number value to a BN
 * @param {String|Number|Object} `arg` input a string number, hex string number, number, BigNumber or BN object
 * @return {Object} `output` BN object of the number
 * @throws if the argument is not an array, object that isn't a bignumber, not a string number or number
 */
export const numberToBN = (arg: string | number | BN | bigint) => {
  if (typeof arg === "bigint") {
    return new BN(arg.toString());
  }
  if (typeof arg === "string" || typeof arg === "number") {
    let multiplier = new BN(1);
    const formattedString = String(arg).toLowerCase().trim();
    const isHexPrefixed =
      formattedString.substring(0, 2) === "0x" ||
      formattedString.substring(0, 3) === "-0x";
    let stringArg = stripHexPrefix(formattedString);
    if (stringArg.substring(0, 1) === "-") {
      stringArg = stripHexPrefix(stringArg.slice(1));
      multiplier = new BN(-1, 10);
    }
    stringArg = stringArg === "" ? "0" : stringArg;

    if (
      (!stringArg.match(/^-?[0-9]+$/) && stringArg.match(/^[0-9A-Fa-f]+$/)) ||
      stringArg.match(/^[a-fA-F]+$/) ||
      (isHexPrefixed === true && stringArg.match(/^[0-9A-Fa-f]+$/))
    ) {
      return new BN(stringArg, 16).mul(multiplier);
    }

    if (
      (stringArg.match(/^-?[0-9]+$/) || stringArg === "") &&
      isHexPrefixed === false
    ) {
      return new BN(stringArg, 10).mul(multiplier);
    }
  } else if (typeof arg === "object" && arg.toString) {
    if (arg.toString(10).match(/^-?[0-9]+$/) && (arg.mul || arg.divn)) {
      return new BN(arg.toString(10), 10);
    }
  }

  throw new Error(
    `[number-to-bn] while converting number 
     ${JSON.stringify(arg)}
      to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported.`
  );
};

export const toBN = (number: string | number) => {
  try {
    return numberToBN(number);
  } catch (e) {
    throw new Error(`${e} Given value: "${number}"`);
  }
};

export const bnToBigInt = (number: BN): bigint => {
  try {
    return BigInt(number.toString());
  } catch (e) {
    throw new Error(`${e} Given value: "${number}"`);
  }
};
