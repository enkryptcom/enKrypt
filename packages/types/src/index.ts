import { NetworkNames } from "./networks";

export * from "./networks";

export enum WalletType {
  mnemonic = "mnemonic",
  privkey = "privkey",
  ledger = "ledger",
  trezor = "trezor",
}
export enum HWwalletType {
  ledger = WalletType.ledger,
  trezor = WalletType.trezor,
}

export enum HWwalletCapabilities {
  signMessage = "signMessage",
  signTx = "signTx",
  eip1559 = "eip1559",
  typedMessage = "typedMessage",
}

enum SigningErrors {
  UnableToVerify = "Signing verification failed",
  NotSupported = "Sign type not supported",
}

enum OtherErrors {
  WrongPassword = "Key derivation failed - possibly wrong passphrase",
}

enum KeyringErrors {
  MnemonicExists = "Mnemonic already exists",
  NotInitialized = "Key ring not initialized",
  NoPassword = "No password set",
  AddressExists = "Address already exists",
  AddressDoesntExists = "Address doesnt exists in the keyring",
  EnckryptDecryptNotSupported = "This Keytype doesnt support encrypt and decrypt",
  CannotUseKeyring = "Cannot use keyring for HW wallets",
  Locked = "Keyring locked",
  CantRemoveMnemonicAddress = "Cannot remove mnemonic addresses",
}

enum SignerType {
  ecdsa = "ecdsa", // polkadot
  ed25519 = "ed25519", // polkadot
  sr25519 = "sr25519", // polkadot
  secp256k1 = "secp256k1", // ethereum
  secp256k1btc = "secp256k1-btc", // bitcoin
}

interface KeyRecordAdd {
  name: string;
  basePath: string;
  signerType: SignerType;
  walletType: WalletType;
}

interface KeyRecord extends KeyRecordAdd {
  address: string;
  publicKey: string;
  pathIndex: number;
}

interface HWwalletOptions {
  networkName: NetworkNames;
  pathTemplate: string;
}

interface EnkryptAccount extends KeyRecord {
  isHardware: boolean;
  HWOptions?: HWwalletOptions;
}

interface HWWalletAdd extends KeyRecord {
  HWOptions: HWwalletOptions;
}

interface KeyPair {
  address?: string;
  privateKey: string;
  publicKey: string;
}

interface KeyPairAdd extends KeyPair {
  address: string;
  name: string;
  signerType: SignerType;
}

interface SignerInterface {
  sign: (
    msgHash: string,
    keypair: KeyPair,
    options?: unknown
  ) => Promise<string>;
  verify: (
    msgHash: string,
    sig: string,
    publicKey: string,
    options?: unknown
  ) => Promise<boolean>;
  generate: (
    mnemonic: string,
    path: string,
    options?: unknown
  ) => Promise<KeyPair>;
}
const Errors = {
  SigningErrors,
  KeyringErrors,
  OtherErrors,
};

interface EncryptedData {
  ciphertext: string;
  salt: string;
  iv: string;
  version: number;
  mac: string;
}
interface BrowserStorageArea {
  get(
    keys?: null | string | string[] | Record<string, any>
  ): Promise<Record<string, any>>;
  set(items: Record<string, any>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

interface RPCRequestType {
  method: string;
  params?: Array<any>;
}

interface RPCResponseType {
  result?: any;
  error?: any;
}

interface ProviderError {
  message: string;
  code: number;
  data?: unknown;
}

type CallbackFunction = (err: ProviderError | null, result?: any) => void;

type NextFunction = () => void;

type MiddlewareFunction = (
  payload: RPCRequestType,
  response: CallbackFunction,
  next: NextFunction
) => void;

interface OnMessageResponse {
  result?: string;
  error?: string;
}
interface SignOptions {
  basePath: string;
  pathIndex: number;
  signerType: SignerType;
  walletType: WalletType;
}

interface EthEncryptedData {
  version: string;
  nonce: string;
  ephemPublicKey: string;
  ciphertext: string;
}

export {
  Errors,
  SignerInterface,
  SignerType,
  KeyRecord,
  KeyRecordAdd,
  KeyPair,
  EncryptedData,
  BrowserStorageArea,
  MiddlewareFunction,
  RPCRequestType,
  RPCResponseType,
  CallbackFunction,
  OnMessageResponse,
  SignOptions,
  ProviderError,
  EthEncryptedData,
  EnkryptAccount,
  HWWalletAdd,
  KeyPairAdd,
};
