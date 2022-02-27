import {
  setNamespace,
  onMessage,
  sendMessage,
} from "@enkryptcom/extension-bridge/dist/window";
import { EXTENSION_NAMESPACE } from "../configs/constants";
setNamespace(EXTENSION_NAMESPACE);
onMessage("show-message", async (message) => {
  console.log(JSON.stringify(message), "inject-script");
});
setTimeout(() => {
  console.log("sending");
  sendMessage(
    "show-message",
    { injected: true, from: "content-script" },
    "background"
  ).then(console.log);
}, 2000);
console.log("hello from injected code");
window.enkrypt = "hello";
