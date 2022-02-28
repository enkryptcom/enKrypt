// import KeyRing from "@enkryptcom/keyring";
// import { SignerType } from "@enkryptcom/types";
// import BrowseStorage from "@/libs/browser-storage";
import { backgroundOnMessage, sendToWindow } from "@/libs/messenger/extension";
import { MessageType, Response } from "@/types/messenger";
import { ProviderName } from "@/types/provider";
// const storage = new BrowseStorage("KeyRing");
// const kr = new KeyRing(storage);
// kr.init("test pass").then(() => {
//     console.log("success")
// }).catch(console.error)
// kr.unlockMnemonic("test pass").then(() => {
//     console.log("start")
//     kr.createKey({
//         basePath: "//",
//         name: "abc",
//         type: SignerType.sr25519``
//     }).then((key) => {
//         console.log("end")
//         console.log(key)
//     })
// })

backgroundOnMessage(MessageType.REQUEST, async (msg): Promise<Response> => {
  console.log(msg);
  sendToWindow(
    MessageType.REQUEST,
    {
      provider: ProviderName.ethereum,
      message: JSON.stringify({
        method: "changeConnected",
        params: [true, "0x1"],
      }),
    },
    msg.sender.tabId
  ).then(console.log);
  return {
    result: "hello from background",
  };
});
