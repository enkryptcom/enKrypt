import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import * as filters from "./utils/filters";
import Vue3Lottie from "vue3-lottie";
const app = createApp(App);

app.use(router).use(store).use(Vue3Lottie);

app.config.globalProperties.$filters = filters;

app.mount("#app");
