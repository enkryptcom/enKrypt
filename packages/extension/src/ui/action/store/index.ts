import { createStore, createLogger } from "vuex";
import main from "./main";
import network from "./network";

export default createStore({
  modules: {
    main,
    network,
  },
  strict: true,
  plugins: process.env.NODE_ENV !== "production" ? [createLogger()] : [],
});
