import { setNamespace, onMessage, sendMessage } from '@enkryptcom/extension-bridge/dist/window'
import { EXTENSION_NAMESPACE } from "../configs/constants"
setNamespace(EXTENSION_NAMESPACE)
onMessage('show-message', async (message) => {
    console.log(JSON.stringify(message), "inject-script")
})
// setInterval(() => {
//     console.log("sending")
//     sendMessage('show-message', { injected: true, from: "window" }, 'content-script')
// }, 2000)
console.log("hello from injected code");
window.enkrypt = "hello"