import HWwalletManager from "./manager";
import { getAddressRequest, HandlerMethods, MessageResponse } from "./types";
import { MessengerName, walletConfigs } from "./configs";
import HWwalletsBackground from "./background";

class HWwallets {
  background: (msg: any) => Promise<any>;

  manager: HWwalletManager;

  constructor(background: (msg: any) => Promise<any>) {
    this.background = background;
    this.manager = new HWwalletManager();
  }

  static methodName = MessengerName;

  async getAddress(options: getAddressRequest): Promise<string> {
    if (walletConfigs[options.wallet].isBackground) {
      return this.background({
        message: JSON.stringify({
          method: HWwallets.methodName,
          params: [HandlerMethods.getAddress, options],
        }),
      }).then((res: MessageResponse) => {
        if (res.error) throw new Error(res.error);
        else return JSON.parse(res.result) as string;
      });
    }
    return this.manager.getAddress(options);
  }
}

export default HWwallets;
export { HWwalletsBackground };
