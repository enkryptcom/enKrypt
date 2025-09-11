// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- True interface.
export default interface Sealer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seal(data: Uint8Array): Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unseal(data: any): Promise<Uint8Array>
}
