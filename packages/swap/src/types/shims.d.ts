import type { Eth } from "web3-eth";

declare module "web3-eth" {
  // @ts-ignore
  export = Eth;
}
