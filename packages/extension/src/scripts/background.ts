import KeyRing from "@enkryptcom/keyring"
import { SignerType } from "@enkryptcom/types";
import browser from 'webextension-polyfill'

console.log("here")
const kr = new KeyRing(browser.storage.local)
// kr.init("test pass")
kr.unlockMnemonic("test pass").then(() => {
    console.log("start")
    kr.createKey({
        basePath: "//",
        name: "abc",
        type: SignerType.sr25519
    }).then((key) => {
        console.log("end")
        console.log(key)
    })
})

console.log("hello from background script");
