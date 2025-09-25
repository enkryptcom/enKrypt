// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- True interface.
export interface Versioner {
  attach(version: Version, data: Uint8Array): Uint8Array
  extract(data: Uint8Array): { version: Version; data: Uint8Array }
}

export enum Version {
  V0 = 0,
  V1 = 1,
}
