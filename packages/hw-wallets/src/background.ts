import HWwalletManager from "./manager";
import { getAddressRequest, HandlerMethods, MessageResponse } from "./types";
import { MessengerName } from "./configs";

class HWwalletsBackground {
  manager: HWwalletManager;

  constructor() {
    this.manager = new HWwalletManager();
  }

  static methodName = MessengerName;

  async backgroundHandler(params: any[]): Promise<MessageResponse> {
    switch (params[0] as HandlerMethods) {
      case HandlerMethods.getAddress:
        return {
          result: JSON.stringify(
            this.manager.getAddress(params[1] as getAddressRequest)
          ),
        };
      default:
        return null;
    }
  }
}

export default HWwalletsBackground;
