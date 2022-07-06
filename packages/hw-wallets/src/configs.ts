import { HWwalletNames } from "@enkryptcom/types";
import { WalletConfigs } from "./types";

const walletConfigs: WalletConfigs = {
  [HWwalletNames.ledger]: {
    isBackground: false,
  },
  [HWwalletNames.trezor]: {
    isBackground: true,
  },
};
const MessengerName = "enkrypt_hw_wallets";
export { walletConfigs, MessengerName };
