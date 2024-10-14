import type { Endpoint } from "@enkryptcom/extension-bridge/dist/types";
import type { ProviderName } from "./provider";
import type { OnMessageResponse, ProviderError } from "@enkryptcom/types";

export enum MessageType {
  WINDOW_REQUEST = "enkrypt_window_request",
  NEWWINDOW_REQUEST = "enkrypt_new_window_request",
  ACTION_REQUEST = "enkrypt_action_request",
  CS_REQUEST = "enkrypt_cs_request",
  BACKGROUND_REQUEST = "enkrypt_background_request",
}
export enum Destination {
  contentScript = "content-script",
  background = "background",
  window = "window",
  newWindow = "new-window",
  popup = "popup",
}

export enum InjectedIDs {
  main = "enkrypt-inject",
}

export enum InternalMethods {
  getEthereumEncryptionPublicKey = "enkrypt_eth_encryption_pubkey",
  ethereumDecrypt = "enkrypt_eth_decrypt",
  sign = "enkrypt_sign_hash",
  unlock = "enkrypt_unlock_keyring",
  lock = "enkrypt_lock_keyring",
  isLocked = "enkrypt_is_locked_keyring",
  newWindowInit = "enkrypt_newWindowInit",
  getSettings = "enkrypt_getAllSettings",
  newWindowUnload = "enkrypt_newWindowUnload",
  sendToTab = "enkrypt_sendToTab",
  getNewAccount = "enkrypt_getNewAccount",
  saveNewAccount = "enkrypt_saveNewAccount",
  changeNetwork = "enkrypt_changeNetwork",
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
  message: Message
) => Promise<OnMessageResponse | void>;

export interface InternalOnMessageResponse {
  result?: string;
  error?: ProviderError;
}
export type InternalMessageType = (
  message: Message
) => Promise<InternalOnMessageResponse>;
