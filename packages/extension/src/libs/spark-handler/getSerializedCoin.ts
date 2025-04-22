function toHexArray(u8: string) {
  return Array.from(
    Buffer.from(u8, 'base64'),
    byte => `0x${byte.toString(16).padStart(2, '0')}`,
  );
}

export const getSerializedCoin = (coin: string[]) => {
  return coin.reduce<string[]>((acc, cur) => {
    const val = toHexArray(cur);

    return acc.concat(val);
  }, []);
};
