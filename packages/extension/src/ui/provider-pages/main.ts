import { createApp } from "vue";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";
import * as filters from "@action/utils/filters";
import Vue3Lottie from "vue3-lottie";
import "@/libs/utils/selective-wasm";

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);

app.use(router).use(Vue3Lottie, { name: "Vue3Lottice" });
app.config.globalProperties.$filters = filters;

app.mount("#app");
