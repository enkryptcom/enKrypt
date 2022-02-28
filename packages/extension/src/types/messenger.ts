import { Endpoint } from "@enkryptcom/extension-bridge/dist/types";

export enum MessageType {
  REQUEST = "enkrypt_request",
}
export enum Destination {
  contentScript = "content-script",
  background = "background",
  window = "window",
}
export enum Provider {
  enkrypt = "enkrypt",
  ethereum = "ethereum",
}
export interface SendMessage {
  [key: string]: any;
  provider: Provider;
  message: string;
}
export interface Message extends SendMessage {
  sender: Endpoint;
}
export interface Response {
  result: string;
  error?: Error;
}

export type onMessgeType = (messge: Message) => Promise<Response | void>;
