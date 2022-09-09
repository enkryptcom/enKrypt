import BigNumber from "bignumber.js";
import { BN } from "ethereumjs-util";
import { toBN, toWei } from "web3-utils";
import { GasPriceTypes } from "@/providers/common/types";

const MED_CONST = 21428571428.571;
const MED_MULTIPLIER = 1.0714285714286;
const FAST_CONST = 42857142857.145;
const FAST_MULTIPLIER = 1.1428571428571;
const FASTEST_CONST = 64285714285.7;
const FASTEST_MULTIPLIER = 1.21828571429;
const LIMITER = 25000000000;

const getEconomy = (gasPrice: string): BN => {
  return toBN(gasPrice);
};
const getRegular = (gasPrice: string): BN => {
  const gpBN = toBN(gasPrice);
  if (gpBN.gt(toBN(LIMITER))) {
    let initialValue = new BigNumber(gasPrice).times(MED_MULTIPLIER);
    initialValue = initialValue.plus(MED_CONST);
    return toBN(new BigNumber(initialValue).toFixed(0));
  }
  return toBN(new BigNumber(gasPrice).times(1.25).toFixed(0));
};
const getFast = (gasPrice: string): BN => {
  const gpBN = toBN(gasPrice);
  if (gpBN.gt(toBN(LIMITER))) {
    let initialValue = new BigNumber(gasPrice).times(FAST_MULTIPLIER);
    initialValue = initialValue.plus(FAST_CONST);
    return toBN(new BigNumber(initialValue).toFixed(0));
  }
  return toBN(new BigNumber(gasPrice).times(1.5).toFixed(0));
};
const getFastest = (gasPrice: string): BN => {
  const gpBN = toBN(gasPrice);
  if (gpBN.gt(toBN(LIMITER))) {
    let initialValue = new BigNumber(gasPrice).times(FASTEST_MULTIPLIER);
    initialValue = initialValue.plus(FASTEST_CONST);
    return toBN(new BigNumber(initialValue).toFixed(0));
  }
  return toBN(new BigNumber(gasPrice).times(1.75).toFixed(0));
};

const getGasBasedOnType = (
  gasPrice: string,
  gasPriceType: GasPriceTypes
): BN => {
  switch (gasPriceType) {
    case GasPriceTypes.ECONOMY:
      return getEconomy(gasPrice);
    case GasPriceTypes.REGULAR:
      return getRegular(gasPrice);
    case GasPriceTypes.FAST:
      return getFast(gasPrice);
    case GasPriceTypes.FASTEST:
      return getFastest(gasPrice);
    default:
      return getEconomy(gasPrice);
  }
};
const getMinPriorityFee = (): BN => {
  return toBN(toWei("1.25", "gwei"));
};

const getPriorityFeeBasedOnType = (
  baseFeePerGas: string,
  gasPrice: string,
  gasPriceType: GasPriceTypes
): BN => {
  const priorityFee = toBN(gasPrice).sub(toBN(baseFeePerGas));
  const minFee = getMinPriorityFee();
  const mediumTip = priorityFee;
  let returnVal;
  switch (gasPriceType) {
    case GasPriceTypes.ECONOMY:
      returnVal = mediumTip.muln(0.8);
      break;
    case GasPriceTypes.REGULAR:
      returnVal = mediumTip;
      break;
    case GasPriceTypes.FAST:
      returnVal = mediumTip.muln(1.25);
      break;
    case GasPriceTypes.FASTEST:
      returnVal = mediumTip.muln(1.5);
      break;
    default:
      returnVal = minFee;
  }
  if (returnVal.lt(minFee)) return minFee;
  return returnVal;
};
const getBaseFeeBasedOnType = (
  baseFee: string,
  gasPriceType: GasPriceTypes
): BN => {
  const baseFeeBN = toBN(baseFee);
  switch (gasPriceType) {
    case GasPriceTypes.ECONOMY:
      return baseFeeBN.muln(1.25);
    case GasPriceTypes.REGULAR:
      return baseFeeBN.muln(1.5);
    case GasPriceTypes.FAST:
      return baseFeeBN.muln(1.75);
    case GasPriceTypes.FASTEST:
      return baseFeeBN.muln(2);
    default:
      return baseFeeBN;
  }
};
const FeeDescriptions = {
  [GasPriceTypes.ECONOMY]: {
    title: "Economy",
    description: "Will likely go through unless activity increases",
    eta: "15 mins",
  },
  [GasPriceTypes.REGULAR]: {
    title: "Recommended",
    description: "Will reliably go through in most scenarios",
    eta: "5 min",
  },
  [GasPriceTypes.FAST]: {
    title: "Higher priority",
    description: "Will go through even if there is a sudden activity increase",
    eta: "2 mins",
  },
  [GasPriceTypes.FASTEST]: {
    title: "Highest priority",
    description: "Will go through, fast, in 99.99% of the cases",
    eta: "1 min",
  },
};
export {
  getBaseFeeBasedOnType,
  getPriorityFeeBasedOnType,
  getGasBasedOnType,
  FeeDescriptions,
};
