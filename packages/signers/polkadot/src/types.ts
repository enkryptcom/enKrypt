export enum SignerTypes {
    ecdsa,
    ed25519,
    sr25519
}
export interface KeyPair {
    secretKey: Uint8Array
    publicKey: Uint8Array
}
export interface SignOptions {
    onlyJS?: boolean
}