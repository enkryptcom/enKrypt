import type { Endpoint } from "@enkryptcom/extension-bridge/dist/types";
import type { ProviderName } from "./provider";
import type { OnMessageResponse, ProviderError } from "@enkryptcom/types";

export enum MessageType {
  WINDOW_REQUEST = "enkrypt_window_request",
  NEWWINDOW_REQUEST = "enkrypt_new_window_request",
  ACTION_REQUEST = "enkrypt_action_request",
}
export enum Destination {
  contentScript = "content-script",
  background = "background",
  window = "window",
  newWindow = "new-window",
}
export enum InternalMethods {
  sign = "enkrypt_sign_hash",
  unlock = "enkrypt_unlock_keyring",
  isLocked = "enkrypt_is_locked_keyring",
  newWindowInit = "enkrypt_newWindowInit",
  newWindowUnload = "enkrypt_newWindowUnload",
  sendToTab = "enkrypt_sendToTab",
}
export interface SendMessage {
  [key: string]: any;
  provider: ProviderName;
  message: string;
}
export interface ActionSendMessage {
  [key: string]: any;
  provider?: ProviderName;
  message: string;
  tabId?: number;
}
export interface Message extends SendMessage {
  sender: Endpoint;
}

export type onMessageType = (
  messge: Message
) => Promise<OnMessageResponse | void>;

export interface InternalOnMessageResponse {
  result?: string;
  error?: ProviderError;
}
export type InternalMessageType = (
  message: Message
) => Promise<InternalOnMessageResponse>;
