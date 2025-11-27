// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- True interface.
export default interface Serializer {
  serialize(data: Uint8Array): string;
  deserialize(data: string): Uint8Array;
}
