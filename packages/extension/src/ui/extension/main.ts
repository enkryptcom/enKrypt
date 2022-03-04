import { createApp } from "vue";
// import KeyRing from "@enkryptcom/keyring"
import App from "./App.vue";
// import { SignerType } from "@enkryptcom/types";

// import "bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import router from "@/router";
// console.log("here")
// const kr = new KeyRing(localStorage)
// // kr.init("test pass")
// kr.unlockMnemonic("test pass").then(() => {
//     console.log("start")
//     kr.createKey({
//         basePath: "//",
//         name: "abc",
//         type: SignerType.sr25519
//     }).then((key) => {
//         console.log("end")
//         console.log(key)
//     })
// })

createApp(App).mount("#app"); //.use(router)
