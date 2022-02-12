// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';
import KeyRing from "../src"
import MemoryStorage from "./memoryStorage"

describe('Keyring locking tests', () => {
    const storage = new MemoryStorage()
    const keyring = new KeyRing(storage, 2000)
    const password = "helloworld"
    // eslint-disable-next-line prefer-arrow-callback,func-names
    it('keyring should lock and unlock properly', function (done) {
        this.timeout(10000)
        keyring.init(password).then(() => {
            expect(keyring.isLocked()).to.be.equals(true)
            keyring.unlockMnemonic(password).then(() => {
                expect(keyring.isLocked()).to.be.equals(false)
                setTimeout(() => {
                    expect(keyring.isLocked()).to.be.equals(true)
                    keyring.lock()
                    done()
                }, 2000)
            })

        })

    });
});