export const SPARK_TX_TYPE = 9;

export const SPARK_TX_TYPE_V2 = 11;
export const SPARK_V2_START_BLOCK = 1_371_000;

export const getSparkTxType = (nextBlockHeight: number) =>
  nextBlockHeight >= SPARK_V2_START_BLOCK ? SPARK_TX_TYPE_V2 : SPARK_TX_TYPE;

export const getSparkSpendVersion = (nextBlockHeight: number) =>
  nextBlockHeight >= SPARK_V2_START_BLOCK ? 2 : 1;

export const LOCK_TIME = 999999;
