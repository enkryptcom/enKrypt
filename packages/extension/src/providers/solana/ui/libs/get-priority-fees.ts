// https://docs.chainstack.com/docs/solana-estimate-priority-fees-getrecentprioritizationfees
import { Connection, PublicKey } from '@solana/web3.js';

interface PrioritizationFeeObject {
  slot: number;
  prioritizationFee: number;
}

interface Config {
  lockedWritableAccounts: PublicKey[];
}

const getPrioritizationFees = async (
  payer: PublicKey,
  connection: Connection,
): Promise<{ low: number; medium: number; high: number }> => {
  try {
    const config: Config = {
      lockedWritableAccounts: [payer],
    };
    const prioritizationFeeObjects =
      (await connection.getRecentPrioritizationFees(
        config,
      )) as PrioritizationFeeObject[];
    if (prioritizationFeeObjects.length === 0) {
      return {
        low: 1000,
        medium: 1500,
        high: 2000,
      };
    }
    const averageFeeIncludingZeros =
      prioritizationFeeObjects.length > 0
        ? Math.floor(
            prioritizationFeeObjects.reduce(
              (acc, feeObject) => acc + feeObject.prioritizationFee,
              0,
            ) / prioritizationFeeObjects.length,
          )
        : 0;
    const nonZeroFees = prioritizationFeeObjects
      .map(feeObject => feeObject.prioritizationFee)
      .filter(fee => fee !== 0);
    const averageFeeExcludingZeros =
      nonZeroFees.length > 0
        ? Math.floor(
            nonZeroFees.reduce((acc, fee) => acc + fee, 0) / nonZeroFees.length,
          )
        : 0;
    const sortedFees = nonZeroFees.sort((a, b) => a - b);
    let medianFee = 0;
    if (sortedFees.length > 0) {
      const midIndex = Math.floor(sortedFees.length / 2);
      medianFee =
        sortedFees.length % 2 !== 0
          ? sortedFees[midIndex]
          : Math.floor((sortedFees[midIndex - 1] + sortedFees[midIndex]) / 2);
    }
    return {
      low: averageFeeIncludingZeros || 1000,
      medium: medianFee || 1500,
      high: averageFeeExcludingZeros || 2000,
    };
  } catch (error) {
    return {
      low: 1000,
      medium: 1500,
      high: 2000,
    };
  }
};

export default getPrioritizationFees;
