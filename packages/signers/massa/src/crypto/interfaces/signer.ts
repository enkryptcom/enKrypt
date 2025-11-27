// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- True interface.
export default interface Signer {
  generatePrivateKey(): Uint8Array;
  getPublicKey(privateKey: Uint8Array): Promise<Uint8Array>;
  sign(privateKey: Uint8Array, data: Uint8Array): Promise<Uint8Array>;
  verify(
    publicKey: Uint8Array,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean>;
}
