import {
  setWindowNamespace,
  sendToBackgroundFromWindow,
} from "@/libs/messenger/window";
import { MessageType, Provider } from "@/types/messenger";
setWindowNamespace();

sendToBackgroundFromWindow(MessageType.REQUEST, {
  provider: Provider.ethreum,
  message: "hello from window",
}).then(console.log);

console.log("hello from injected code");
window.enkrypt = "hello";
