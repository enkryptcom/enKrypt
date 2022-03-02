import { Endpoint } from "@enkryptcom/extension-bridge/dist/types";
import { ProviderName } from "./provider";
import { OnMessageResponse } from "@enkryptcom/types";

export enum MessageType {
  REQUEST = "enkrypt_request",
}
export enum Destination {
  contentScript = "content-script",
  background = "background",
  window = "window",
}
export interface SendMessage {
  [key: string]: any;
  provider: ProviderName;
  message: string;
}
export interface Message extends SendMessage {
  sender: Endpoint;
}

export type onMessgeType = (
  messge: Message
) => Promise<OnMessageResponse | void>;
