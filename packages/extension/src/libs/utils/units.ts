/*
Primary Attribution
Richard Moore <ricmoo@me.com>
https://github.com/ethers-io

Note, Richard is a god of ether gods. Follow and respect him, and use Ethers.io!
*/

import { toBN } from "web3-utils";

const zero = toBN(0);
const negative1 = toBN(-1);

/**
 * Returns value of unit in Wei
 *
 * @method getValueOfUnit
 * @param {number} decimals the unit to convert to, default ether
 * @returns {BN} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
const getValueOfUnit = (decimals: number) => {
  return toBN(10).pow(toBN(decimals));
};

const numberToString = (arg: any) => {
  if (typeof arg === "string") {
    if (!arg.match(/^-?[0-9.]+$/)) {
      throw new Error(
        `while converting number to string, invalid number value '${arg}', should be a number matching (^-?[0-9.]+).`
      );
    }
    return arg;
  } else if (typeof arg === "number") {
    return String(arg);
  } else if (
    typeof arg === "object" &&
    arg.toString &&
    (arg.toTwos || arg.dividedToIntegerBy)
  ) {
    if (arg.toPrecision) {
      return String(arg.toPrecision());
    } else {
      // eslint-disable-line
      return arg.toString(10);
    }
  }
  throw new Error(
    `while converting number to string, invalid number value '${arg}' type ${typeof arg}.`
  );
};

const fromBase = (
  weiInput: string,
  decimals: number,
  optionsInput?: any
): string => {
  let wei = toBN(weiInput); // eslint-disable-line
  let negative = wei.lt(zero); // eslint-disable-line
  const base = getValueOfUnit(decimals);
  const baseLength = base.toString().length - 1 || 1;
  const options = optionsInput || {};

  if (negative) {
    wei = wei.mul(negative1);
  }

  let fraction = wei.mod(base).toString(10); // eslint-disable-line

  while (fraction.length < baseLength) {
    fraction = `0${fraction}`;
  }
  if (!options.pad) {
    fraction = (fraction.match(/^([0-9]*[1-9]|0)(0*)/) as string[])[1];
  }

  let whole = wei.div(base).toString(10); // eslint-disable-line

  if (options.commify) {
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let value = `${whole}${fraction == "0" ? "" : `.${fraction}`}`; // eslint-disable-line

  if (negative) {
    value = `-${value}`;
  }

  return value;
};

const toBase = (etherInput: string, decimals: number): string => {
  let ether = numberToString(etherInput); // eslint-disable-line
  const base = getValueOfUnit(decimals);
  const baseLength = base.toString().length - 1 || 1;

  // Is it negative?
  let negative = ether.substring(0, 1) === "-"; // eslint-disable-line
  if (negative) {
    ether = ether.substring(1);
  }

  if (ether === ".") {
    throw new Error(
      `[ethjs-unit] while converting number ${etherInput} to wei, invalid value`
    );
  }

  // Split it into a whole and fractional part
  let comps = ether.split("."); // eslint-disable-line
  if (comps.length > 2) {
    throw new Error(
      `[ethjs-unit] while converting number ${etherInput} to wei,  too many decimal points`
    );
  }

  let whole = comps[0],
    fraction = comps[1]; // eslint-disable-line

  if (!whole) {
    whole = "0";
  }
  if (!fraction) {
    fraction = "0";
  }
  if (fraction.length > baseLength) {
    throw new Error(
      `[ethjs-unit] while converting number ${etherInput} to wei, too many decimal places`
    );
  }

  while (fraction.length < baseLength) {
    fraction += "0";
  }

  whole = toBN(whole);
  fraction = toBN(fraction);
  let wei = whole.mul(base).add(fraction); // eslint-disable-line

  if (negative) {
    wei = wei.mul(negative1);
  }

  return wei.toString();
};

const isValidDecimals = (amount: string, decimals: number): boolean => {
  const numDecimals = amount.split(".")[1]?.length;

  if (numDecimals && numDecimals > decimals) {
    return false;
  }

  return true;
};

export { fromBase, toBase, isValidDecimals };
