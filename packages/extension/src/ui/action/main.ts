import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import * as filters from "./utils/filters";
import Vue3Lottie from "vue3-lottie";
import "@/libs/utils/selective-wasm";
import { UNSResolver } from "@/libs/utils/uns";

const app = createApp(App);

app.use(router).use(Vue3Lottie);

app.config.globalProperties.$filters = filters;
app.config.globalProperties.$domainResolver = new UNSResolver();

app.mount("#app");
