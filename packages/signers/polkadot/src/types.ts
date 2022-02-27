export interface KeyPair {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
}
export interface SignOptions {
  onlyJS?: boolean;
}
