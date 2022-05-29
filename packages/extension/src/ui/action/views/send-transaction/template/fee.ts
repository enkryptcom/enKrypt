import { GasPriceTypes } from "@/providers/ethereum/libs/transaction/types";
import { TransactionFeeSpeed } from "@/ui/action/types/fee";

const PRIORITIES = [
  GasPriceTypes.ECONOMY,
  GasPriceTypes.REGULAR,
  GasPriceTypes.FAST,
  GasPriceTypes.FASTER,
];

const FEES = {
  0: {
    title: "Economy" as string,
    description: "Will likely go trough unless activity increases" as string,
    speed: TransactionFeeSpeed.economy,
  },
  1: {
    title: "Recommended" as string,
    description: "Will reliably go through in most scenarios" as string,
    speed: TransactionFeeSpeed.recommended as number,
  },
  2: {
    title: "Higher priority" as string,
    description:
      "Will go through even if there is sudden activity increase" as string,
    speed: TransactionFeeSpeed.higherPriority as number,
  },
  3: {
    title: "Highest priority" as string,
    description: "Will go through fast in 99.99% of the cases" as string,
    speed: TransactionFeeSpeed.highestPriority as number,
  },
};

export { PRIORITIES, FEES };
