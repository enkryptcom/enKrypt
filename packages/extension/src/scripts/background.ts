// import KeyRing from "@enkryptcom/keyring";
// import { SignerType } from "@enkryptcom/types";
// import BrowseStorage from "@/libs/browser-storage";
import { backgroundOnMessage, sendToWindow } from "@/libs/messenger/extension";
import { MessageType, Response } from "@/types/messenger";
import { ProviderName } from "@/types/provider";
import { getError } from "@/providers/ethereum/libs/error-handler";
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
  const req = JSON.parse(msg.message);
  if (req.method === "eth_requestAccounts" || req.method === "eth_accounts") {
    return {
      result: JSON.stringify(["0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D"]),
    };
  } else if (req.method === "eth_chainId") {
    return {
      result: JSON.stringify("0x1"),
    };
  } else if (req.method === "net_version") {
    return {
      result: JSON.stringify(1),
    };
  }
  return {
    error: JSON.stringify(getError(4200)),
  };
});
