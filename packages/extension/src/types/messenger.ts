import { Endpoint } from "@enkryptcom/extension-bridge/dist/types";
import { ProviderName } from "./provider";

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
export interface Response {
  result: string;
  error?: string | Error;
}
export type onMessgeType = (messge: Message) => Promise<Response | void>;
