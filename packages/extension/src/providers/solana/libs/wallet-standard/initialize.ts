import { registerWallet } from "./register";
import { EnkryptWallet } from "./wallet";
import type { Enkrypt } from "./window";

export function initialize(enkrypt: Enkrypt): void {
  console.log(new EnkryptWallet(enkrypt));
  registerWallet(new EnkryptWallet(enkrypt));
}
