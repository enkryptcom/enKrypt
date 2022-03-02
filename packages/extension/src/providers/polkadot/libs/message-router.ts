import { RouterOnMessage } from "../types";
import InjectedProvider from "./injected-provider";
class MessageRouter {
  providers: [InjectedProvider?] = [];

  addProvider(provider: InjectedProvider): void {
    this.providers.push(provider);
  }
  nextPosition(): number {
    return this.providers.length;
  }
  handleMessage(message: string): void {
    const { providerId, action } = JSON.parse(message) as RouterOnMessage;
    if (this.providers[providerId]) {
      this.providers[providerId]?.handleMessage(action);
    } else {
      console.error(`Provider id is missing: ${message} id: ${providerId}`);
    }
  }
}
export default MessageRouter;
