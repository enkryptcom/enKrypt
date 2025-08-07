import { PublicKey } from '@solana/web3.js';
const isAddress = (address: string): boolean => {
  try {
    const addPub = new PublicKey(address);
    return PublicKey.isOnCurve(addPub.toBytes());
  } catch {
    return false;
  }
};

export { isAddress };
