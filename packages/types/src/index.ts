
enum SigningErrors {
    UnableToVerify = "Signing verification failed",
    NotSupported = "Sign type not supported"
}

enum OtherErrors {
    WrongPassword = "Key derivation failed - possibly wrong passphrase",
}

enum KeyringErrors {
    MnemonicExists = "Mnemonic already exists",
    NotInitialized = "Key ring not initialized",
    NoPassword = "No password set",
    AddressExists = "Address already exists",
    Locked = "Keyring locked"
}

enum SignerType {
    ecdsa = "ecdsa", // polkadot
    ed25519 = "ed25519", // polkadot
    sr25519 = "sr25519", // polkadot
    secp256k1 = "secp256k1" // ethereum
}

interface KeyRecordAdd {
    name: string
    basePath: string
    type: SignerType
}

interface KeyRecord extends KeyRecordAdd {
    address: string
    publicKey: string
    pathIndex: number
}

interface KeyPair {
    address?: string
    privateKey: string
    publicKey: string
}

interface SignerInterface {
    sign: (msgHash: string, keypair: KeyPair, options?: unknown) => Promise<string>;
    verify: (msgHash: string, sig: string, publicKey: string, options?: unknown) => Promise<boolean>;
    generate: (mnemonic: string, path: string, options?: unknown) => Promise<KeyPair>;
}
const Errors = {
    SigningErrors,
    KeyringErrors,
    OtherErrors
}

interface EncryptedData {
    ciphertext: string
    salt: string
    iv: string
    version: number
    mac: string
}
interface BrowserStorageArea {
    get(keys?: null | string | string[] | Record<string, any>): Promise<Record<string, any>>;
    set(items: Record<string, any>): Promise<void>;
    remove(keys: string | string[]): Promise<void>;
    clear(): Promise<void>;
}
export {
    Errors,
    SignerInterface,
    SignerType,
    KeyRecord,
    KeyRecordAdd,
    KeyPair,
    EncryptedData,
    BrowserStorageArea
}