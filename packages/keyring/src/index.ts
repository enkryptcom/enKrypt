import { KeyRingStorage, KeyRecordAdd, KeyRecord, Errors, SignerInterface, SignerType } from "@enkryptcom/types"
import { entropyToMnemonic, generateMnemonic, mnemonicToEntropy } from "bip39"
import { hexToBuffer, encrypt, decrypt } from "@enkryptcom/utils"
import PolkadotSigner from "@enkryptcom/signer-polkadot"
import EthereumSigner from "@enkryptcom/signer-ethereum"
import assert from "assert"
import configs from "./configs"
import { pathParser } from "./utils"

class KeyRing {

    storage: KeyRingStorage

    private _isLocked: boolean

    signers: { [key in SignerType]: SignerInterface }

    pathIndexCounter: { [key: string]: number } = {}

    private _mnemonic: string

    private _autoLock: number

    autoLockTime: number

    constructor(storage: KeyRingStorage, locktime = 30 * 60 * 1000) {
        this.storage = storage
        this._isLocked = true;
        this.autoLockTime = locktime;

        this.signers = {
            [SignerType.secp256k1]: new EthereumSigner(),
            [SignerType.ecdsa]: new PolkadotSigner(SignerType.ecdsa),
            [SignerType.ed25519]: new PolkadotSigner(SignerType.ed25519),
            [SignerType.sr25519]: new PolkadotSigner(SignerType.sr25519)
        }
    }

    async init(password: string, {
        strength = configs.MNEMONIC_STRENGTH,
        mnemonic = generateMnemonic(strength)
    }: { strength?: number, mnemonic?: string } = {}): Promise<void> {
        assert(!this.storage.getItem(configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC), Errors.KeyringErrors.MnemonicExists)
        assert(password, Errors.KeyringErrors.NoPassword)
        const entropy = hexToBuffer(mnemonicToEntropy(mnemonic))
        const encrypted = await encrypt(entropy, password)
        this.storage.setItem(configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC, JSON.stringify(encrypted))
    }

    async getPathIndex(basePath: string): Promise<number> {
        if (!this.pathIndexCounter[basePath]) return 0;
        return this.pathIndexCounter[basePath] + 1;
    }

    private async _getMnemonic(password: string): Promise<string> {
        const encrypted = this.storage.getItem(configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC)
        assert(encrypted, Errors.KeyringErrors.NotInitialized)
        const jdecrypted = JSON.parse(encrypted)
        const decryptedEntropy = await decrypt(jdecrypted, password)
        return entropyToMnemonic(decryptedEntropy)
    }

    async unlockMnemonic(password: string): Promise<void> {
        this._mnemonic = await this._getMnemonic(password);
        this._isLocked = false
        if (this.autoLockTime !== 0) {
            clearTimeout(this._autoLock)
            setTimeout(() => {
                this._mnemonic = null;
                this._isLocked = true;
            }, this.autoLockTime)
        }
    }

    async getMnemonic(password: string): Promise<string> {
        return this._getMnemonic(password);
    }

    async createKey(key: KeyRecordAdd): Promise<KeyRecord> {
        assert(!this._isLocked, Errors.KeyringErrors.Locked)
        const nextIndex = await this.getPathIndex(key.basePath)
        const keypair = await this.signers[key.type].generate(this._mnemonic, pathParser(key.basePath, nextIndex, key.type))
        return {
            address: keypair.address,
            basePath: key.basePath,
            name: key.name,
            pathIndex: nextIndex,
            publicKey: keypair.publicKey,
            type: key.type
        }
    }

    async getKeysObject(): Promise<{ [key: string]: KeyRecord }> {
        const jsonstr = this.storage.getItem(configs.STORAGE_KEYS.KEY_INFO)
        if (!jsonstr) return {}
        return JSON.parse(jsonstr)
    }

    async getKeysArray(): Promise<KeyRecord[]> {
        return Object.values(await this.getKeysObject())
    }

    isLocked(): boolean {
        return this._isLocked
    }

    lock(): void {
        clearTimeout(this._autoLock)
        this._mnemonic = null;
        this._isLocked = true;
    }
}

export default KeyRing