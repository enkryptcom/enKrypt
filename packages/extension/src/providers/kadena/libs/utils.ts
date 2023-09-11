const formatDecimals = (value: string, decimals: number): string => {
  const intLength = value.substring(0, value.indexOf(".")).length;

  return value.replace(".", "").padEnd(decimals + intLength, "0");
};

export { formatDecimals };
