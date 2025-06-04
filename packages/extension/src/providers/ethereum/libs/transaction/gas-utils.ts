import BigNumber from 'bignumber.js';
import { toBN, toWei } from 'web3-utils';
import { BNType, GasPriceTypes } from '@/providers/common/types';
import rsk from '../../networks/rsk';
import rskTestnet from '../../networks/rsk-testnet';
import { FeeHistoryResult } from 'web3-eth';
import { FormattedFeeHistory } from './types';

const MED_CONST = 21428571428.571;
const MED_MULTIPLIER = 1.0714285714286;
const FAST_CONST = 42857142857.145;
const FAST_MULTIPLIER = 1.1428571428571;
const FASTEST_CONST = 64285714285.7;
const FASTEST_MULTIPLIER = 1.21828571429;
const LIMITER = 25000000000;
const GAS_PERCENTILES = [25, 50, 75, 90];

const getEconomy = (gasPrice: string): BNType => {
  return toBN(gasPrice);
};
const getRegular = (gasPrice: string): BNType => {
  const gpBN = toBN(gasPrice);
  if (gpBN.gt(toBN(LIMITER))) {
    let initialValue = new BigNumber(gasPrice).times(MED_MULTIPLIER);
    initialValue = initialValue.plus(MED_CONST);
    return toBN(new BigNumber(initialValue).toFixed(0));
  }
  return toBN(new BigNumber(gasPrice).times(1.25).toFixed(0));
};
const getFast = (gasPrice: string): BNType => {
  const gpBN = toBN(gasPrice);
  if (gpBN.gt(toBN(LIMITER))) {
    let initialValue = new BigNumber(gasPrice).times(FAST_MULTIPLIER);
    initialValue = initialValue.plus(FAST_CONST);
    return toBN(new BigNumber(initialValue).toFixed(0));
  }
  return toBN(new BigNumber(gasPrice).times(1.5).toFixed(0));
};
const getFastest = (gasPrice: string): BNType => {
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
  gasPriceType: GasPriceTypes,
): BNType => {
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
const getMinPriorityFee = (): BNType => {
  return toBN(toWei('1', 'gwei'));
};
const getPriorityFeeAvg = (arr: BNType[]): BNType => {
  const sum = arr.reduce((a, v) => a.add(v));
  const fee = sum.divn(arr.length);
  if (fee.eqn(0)) return getMinPriorityFee();
  return fee;
};

const getPriorityFeeBasedOnType = (
  gasFeeHistory: FormattedFeeHistory,
  gasPriceType: GasPriceTypes,
): BNType => {
  if (gasFeeHistory.blocks.length === 0) return getMinPriorityFee();
  switch (gasPriceType) {
    case GasPriceTypes.ECONOMY:
      return getPriorityFeeAvg(
        gasFeeHistory.blocks.map(b => b.priorityFeePerGas[0]),
      );
    case GasPriceTypes.REGULAR:
      return getPriorityFeeAvg(
        gasFeeHistory.blocks.map(b => b.priorityFeePerGas[1]),
      );
    case GasPriceTypes.FAST:
      return getPriorityFeeAvg(
        gasFeeHistory.blocks.map(b => b.priorityFeePerGas[2]),
      );
    case GasPriceTypes.FASTEST:
      return getPriorityFeeAvg(
        gasFeeHistory.blocks.map(b => b.priorityFeePerGas[3]),
      );
    default:
      return getMinPriorityFee();
  }
};

const formatFeeHistory = (
  feeHistory: FeeHistoryResult,
): FormattedFeeHistory => {
  const historicalBlocks = feeHistory.baseFeePerGas.length - 1;
  let blockNum = toBN(feeHistory.oldestBlock).toNumber();
  let index = 0;
  let blocks = [];
  let highestBaseFee = toBN(0);
  while (blockNum < Number(feeHistory.oldestBlock) + historicalBlocks) {
    const blockBaseFee = toBN(feeHistory.baseFeePerGas[index]);
    if (blockBaseFee.gt(highestBaseFee)) highestBaseFee = blockBaseFee;
    blocks.push({
      number: blockNum,
      baseFeePerGas: blockBaseFee,
      gasUsedRatio: feeHistory.gasUsedRatio[index],
      priorityFeePerGas: feeHistory.reward
        ? feeHistory.reward[index]
            .map(x => toBN(x))
            .sort((a, b) => a.sub(b).toNumber())
        : GAS_PERCENTILES.map(() => toBN(0)),
    });
    blockNum += 1;
    index += 1;
  }
  blocks = blocks.filter(b => b.gasUsedRatio !== 0);
  const pendingBaseFee = toBN(feeHistory.baseFeePerGas[historicalBlocks]);
  if (pendingBaseFee.gt(highestBaseFee)) highestBaseFee = pendingBaseFee;
  return {
    blocks,
    pendingBlock: {
      number: 'pending',
      baseFeePerGas: pendingBaseFee,
      gasUsedRatio: 0,
      priorityFeePerGas: [],
    },
    highestBaseFee,
  };
};

const getBaseFeeBasedOnType = (
  baseFee: string,
  gasPriceType: GasPriceTypes,
): BNType => {
  const baseFeeBN = toBN(baseFee);
  switch (gasPriceType) {
    case GasPriceTypes.ECONOMY:
      return baseFeeBN;
    case GasPriceTypes.REGULAR:
      return baseFeeBN.muln(1.25);
    case GasPriceTypes.FAST:
      return baseFeeBN.muln(1.35);
    case GasPriceTypes.FASTEST:
      return baseFeeBN.muln(1.45);
    default:
      return baseFeeBN;
  }
};
const FeeDescriptions = {
  [GasPriceTypes.ECONOMY]: {
    title: 'Economy',
    description: 'Will likely go through unless activity increases',
    eta: '5 mins',
  },
  [GasPriceTypes.REGULAR]: {
    title: 'Recommended',
    description: 'Will reliably go through in most scenarios',
    eta: '2 mins',
  },
  [GasPriceTypes.FAST]: {
    title: 'Higher priority',
    description: 'Will go through even if there is a sudden activity increase',
    eta: '1 mins',
  },
  [GasPriceTypes.FASTEST]: {
    title: 'Highest priority',
    description: 'Will go through, fast, in 99.99% of the cases',
    eta: '30 secs',
  },
};
const collectiveGasConfig = {
  [rsk.chainID]: {
    // rsk mainnet
    stakingUrl:
      'https://rootstock.blockscout.com/api/v2/tokens/0x5db91e24BD32059584bbDb831A901f1199f3d459/transfers',
    txUrl: 'https://rootstock.blockscout.com/api/v2/transactions',
    method: 'depositAndDelegate',
    methodId: '0xfbde32f8',
  },
  [rskTestnet.chainID]: {
    // rsk testnet
    stakingUrl:
      'https://rootstock-testnet.blockscout.com/api/v2/tokens/0xc4b091D97ad25cEa5922F09fE80711B7acbBB16f/transfers',
    txUrl: 'https://rootstock-testnet.blockscout.com/api/v2/transactions',
    method: 'depositAndDelegate',
    methodId: '0xfbde32f8',
  },
};

const safeGasForStaking = async (chainID: string, estimatedGas: number) => {
  const gasConfig = collectiveGasConfig[chainID];
  try {
    const stakingResponse = await fetch(gasConfig.stakingUrl);
    if (!stakingResponse.ok) {
      return estimatedGas;
    }
    const stakingTxHistory = await stakingResponse.json();

    for (const tx of stakingTxHistory.items) {
      // find stake tx
      if (tx.method === gasConfig.method) {
        const txDetailsResponse = await fetch(
          `${gasConfig.txUrl}/${tx.transaction_hash}`,
        );

        if (!txDetailsResponse.ok) {
          return estimatedGas;
        }
        const txDetail = await txDetailsResponse.json();
        // tx must be successfull
        if (txDetail.status === 'ok') {
          const txGasLimit = Number(txDetail.gas_limit);
          const txGasUsed = Number(txDetail.gas_used);
          // if web3 estimate gas is less than previous stake tx gas used
          // This could cause tx to fail due to less gas
          // Bump the gas limit particularly in this case
          if (estimatedGas < txGasUsed) {
            // Check if need to add buffer
            const usedGasPercentage = (txGasUsed / txGasLimit) * 100;
            if (usedGasPercentage > 80) {
              // add a safe buffer of 30%
              return Math.max(txGasUsed + txGasUsed * 0.3, txGasLimit);
            }
            // safe buffer not required, just use gas limit
            return txGasLimit;
          }
          // safe to use max of estimate or tx gas limit
          return Math.max(estimatedGas, txGasLimit);
        }
      }
    }
    // No previous stake tx found, just return web3 estimated gas.
    return estimatedGas;
  } catch {
    return estimatedGas;
  }
};
export {
  getBaseFeeBasedOnType,
  getPriorityFeeBasedOnType,
  safeGasForStaking,
  collectiveGasConfig,
  getGasBasedOnType,
  FeeDescriptions,
  formatFeeHistory,
  GAS_PERCENTILES,
};
