import {
  onMessage,
  sendMessage,
  allowWindowMessaging,
} from "@enkryptcom/extension-bridge";
import { EXTENSION_NAMESPACE } from "@/configs/constants";
import {
  Message,
  MessageType,
  Destination,
  onMessageType,
  SendMessage,
  InternalMessageType,
  InternalOnMessageResponse,
  ActionSendMessage,
} from "@/types/messenger";
import { OnMessageResponse } from "@enkryptcom/types";
import { assert } from "chai";

export const sendToWindow = (
  message: SendMessage,
  tabId: number
): Promise<OnMessageResponse> => {
  return sendMessage(
    MessageType.WINDOW_REQUEST,
    message,
    `${Destination.window}@${tabId}`
  ).then((res) => res as unknown as OnMessageResponse);
};

export const setContentScriptNamespace = (): void => {
  allowWindowMessaging(EXTENSION_NAMESPACE);
};

export const sendToBackgroundFromNewWindow = (
  message: SendMessage
): Promise<InternalOnMessageResponse> => {
  return sendMessage(
    MessageType.NEWWINDOW_REQUEST,
    message,
    Destination.background
  ).then((res) => res as unknown as InternalOnMessageResponse);
};

export const sendToBackgroundFromAction = (
  message: ActionSendMessage
): Promise<InternalOnMessageResponse> => {
  return sendMessage(
    MessageType.ACTION_REQUEST,
    message,
    Destination.background
  ).then((res) => res as unknown as InternalOnMessageResponse);
};

export const sendToNewWindowFromBackground = (
  message: SendMessage,
  tabId: number
): Promise<InternalOnMessageResponse> => {
  return sendMessage(
    MessageType.NEWWINDOW_REQUEST,
    message,
    `${Destination.newWindow}@${tabId}`
  ).then((res) => res as unknown as InternalOnMessageResponse);
};

const backgroundOnMessage = (
  type: MessageType,
  cb: onMessageType | InternalMessageType
): void => {
  onMessage(type, async (message) => {
    const msg = message.data as Message;
    msg.sender = message.sender;
    return cb(msg);
  });
};
export const backgroundOnMessageFromWindow = (cb: onMessageType): void => {
  backgroundOnMessage(MessageType.WINDOW_REQUEST, (message) => {
    assert(
      message.sender.context === "window",
      "Message didnt come from window"
    );
    return cb(message);
  });
};

export const backgroundOnMessageFromNewWindow = (
  cb: InternalMessageType
): void => {
  backgroundOnMessage(MessageType.NEWWINDOW_REQUEST, async (message) => {
    assert(
      message.sender.context === "new-window",
      "Message didnt come from new-window"
    );
    return cb(message);
  });
};

export const backgroundOnMessageFromAction = (
  cb: InternalMessageType
): void => {
  backgroundOnMessage(MessageType.ACTION_REQUEST, async (message) => {
    assert(message.sender.context === "popup", "Message didnt come from popup");
    return cb(message);
  });
};

export const newWindowOnMessageFromBackground = (
  cb: InternalMessageType
): void => {
  backgroundOnMessage(MessageType.NEWWINDOW_REQUEST, async (message) => {
    assert(
      message.sender.context === "background",
      "Message didnt come from background"
    );
    return cb(message);
  });
};
