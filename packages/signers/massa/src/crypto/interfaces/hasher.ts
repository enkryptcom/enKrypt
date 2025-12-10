// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- True interface.
export default interface Hasher {
  hash(data: Buffer | Uint8Array | string): Uint8Array;
}
