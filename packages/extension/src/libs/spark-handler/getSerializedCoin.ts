function toHexArray(u8: string) {
  return Array.from(
    Buffer.from(u8, 'base64'),
    byte => `0x${byte.toString(16).padStart(2, '0')}`,
  );
}

export const base64ToHex = (base64: string): string => {
  const raw = Buffer.from(base64, 'base64');

  return raw.toString('hex');
};

export const getSerializedCoin = (coin: string) => {
  return toHexArray(coin);
};
