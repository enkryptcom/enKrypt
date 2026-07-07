export const numberToReversedHex = (num: number) => {
  let hex = num.toString(16);

  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }

  const bytes = hex.match(/.{2}/g);
  const reversed = bytes?.reverse();

  return reversed?.join('');
};

export const base64ToReversedHex = (base64: string): string => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const reversed = Array.from(bytes).reverse();
  return reversed.map(b => b.toString(16).padStart(2, '0')).join('');
};
