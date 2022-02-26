// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';
import { KeyRecordAdd, SignerType } from '@enkryptcom/types';
import { MemoryStorage } from "@enkryptcom/utils"
import Storage from '@enkryptcom/storage';
import KeyRing from "../src"

describe('Keyring create tests', () => {
    const password = "helloworld"
    const MNEMONIC = "bottom drive obey lake curtain smoke basket hold race lonely fit walk"
    // eslint-disable-next-line prefer-arrow-callback,func-names
    it('keyring should generate sr25519 keys', async () => {
        const memStorage = new MemoryStorage()
        const storage = new Storage("keyring", { storage: memStorage })
        const keyring = new KeyRing(storage)
        await keyring.init(password, { mnemonic: MNEMONIC })
        const keyAdd: KeyRecordAdd = {
            basePath: "//",
            type: SignerType.sr25519,
            name: "0index"
        }
        await keyring.unlockMnemonic(password)
        const pair = await keyring.createKey(keyAdd)
        expect(pair.type).equals(SignerType.sr25519)
        expect(pair.pathIndex).equals(0)
        expect(pair.address).equals("5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV")
        keyring.lock()
    }).timeout(20000)
    it('keyring should generate ecdsa keys', async () => {
        const memStorage = new MemoryStorage()
        const storage = new Storage("keyring", { storage: memStorage })
        const keyring = new KeyRing(storage)
        await keyring.init(password, { mnemonic: MNEMONIC })
        const keyAdd: KeyRecordAdd = {
            basePath: "//",
            type: SignerType.ecdsa,
            name: "0index"
        }
        await keyring.unlockMnemonic(password)
        const pair = await keyring.createKey(keyAdd)
        expect(pair.type).equals(SignerType.ecdsa)
        expect(pair.pathIndex).equals(0)
        expect(pair.address).equals("5GKyBtzbxKU1qjhZrKpMiwtJj7o6jJcXbKQVtYq74DCPerXN")
    }).timeout(20000)
    it('keyring should generate ed25519 keys', async () => {
        const memStorage = new MemoryStorage()
        const storage = new Storage("keyring", { storage: memStorage })
        const keyring = new KeyRing(storage)
        await keyring.init(password, { mnemonic: MNEMONIC })
        const keyAdd: KeyRecordAdd = {
            basePath: "//",
            type: SignerType.ed25519,
            name: "0index"
        }
        await keyring.unlockMnemonic(password)
        const pair = await keyring.createKey(keyAdd)
        expect(pair.type).equals(SignerType.ed25519)
        expect(pair.pathIndex).equals(0)
        expect(pair.address).equals("5DFJF7tY4bpbpcKPJcBTQaKuCDEPCpiz8TRjpmLeTtweqmXL")
    }).timeout(20000)
    it('keyring should generate ethereum keys', async () => {
        const memStorage = new MemoryStorage()
        const storage = new Storage("keyring", { storage: memStorage })
        const keyring = new KeyRing(storage)
        await keyring.init(password, { mnemonic: MNEMONIC })
        const keyAdd: KeyRecordAdd = {
            basePath: "m/44'/60'/0'/0",
            type: SignerType.secp256k1,
            name: "0index"
        }
        await keyring.unlockMnemonic(password)
        const pair = await keyring.createKey(keyAdd)
        expect(pair.type).equals(SignerType.secp256k1)
        expect(pair.pathIndex).equals(0)
        expect(pair.address).equals("0xf24ff3a9cf04c71dbc94d0b566f7a27b94566cac")
    }).timeout(20000)
});