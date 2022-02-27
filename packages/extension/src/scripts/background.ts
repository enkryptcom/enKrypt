import KeyRing from "@enkryptcom/keyring"
import { SignerType } from "@enkryptcom/types";
import BrowseStorage from "@/libs/browser-storage"
import { onMessage, sendMessage } from '@enkryptcom/extension-bridge'
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

onMessage('show-message', async (message) => {
    console.log(JSON.stringify(message), "background-script")
})


// setInterval(() => {
//     sendMessage('show-message', { frombackground: true }, 'content-script@642')
// }, 3000)
console.log("hello from background script");
