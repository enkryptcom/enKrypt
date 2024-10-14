import * as filters from "@action/utils/filters";
import type { Eth } from "web3-eth";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $filters: filters;
  }
}

declare module "web3-eth" {
  export = Eth;
}
