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
    const { id, method, params } = JSON.parse(message) as RouterOnMessage;
    if (this.providers[id]) {
      this.providers[id]?.handleMessage({ method, params });
    } else {
      console.error(`Provider id is missing: ${message} id: ${id}`);
    }
  }
}
export default MessageRouter;
