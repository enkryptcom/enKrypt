import KeyRing from "@enkryptcom/keyring"
import { SignerType } from "@enkryptcom/types";
import BrowseStorage from "@/libs/browser-storage"

console.log("here")
const storage = new BrowseStorage("KeyRing")
const kr = new KeyRing(storage)
// kr.init("test pass").then(() => {
//     console.log("success")
// }).catch(console.error)
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
