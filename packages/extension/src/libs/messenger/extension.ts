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
  onMessgeType,
  SendMessage,
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
): Promise<OnMessageResponse> => {
  return sendMessage(
    MessageType.NEWWINDOW_REQUEST,
    message,
    Destination.background
  ).then((res) => res as unknown as OnMessageResponse);
};

export const sendToNewWindowFromBackground = (
  message: SendMessage,
  tabId: number
): Promise<OnMessageResponse> => {
  return sendMessage(
    MessageType.NEWWINDOW_REQUEST,
    message,
    `${Destination.newWindow}@${tabId}`
  ).then((res) => res as unknown as OnMessageResponse);
};

const backgroundOnMessage = (type: MessageType, cb: onMessgeType): void => {
  onMessage(type, async (message) => {
    const msg = message.data as Message;
    msg.sender = message.sender;
    return cb(msg);
  });
};
export const backgroundOnMessageFromWindow = (cb: onMessgeType): void => {
  backgroundOnMessage(MessageType.WINDOW_REQUEST, async (message) => {
    assert(
      message.sender.context === "window",
      "Message didnt come from window"
    );
    return cb(message);
  });
};

export const backgroundOnMessageFromNewWindow = (cb: onMessgeType): void => {
  backgroundOnMessage(MessageType.NEWWINDOW_REQUEST, async (message) => {
    assert(
      message.sender.context === "new-window",
      "Message didnt come from new-window"
    );
    return cb(message);
  });
};

export const newWindowOnMessageFromBackground = (cb: onMessgeType): void => {
  backgroundOnMessage(MessageType.NEWWINDOW_REQUEST, async (message) => {
    assert(
      message.sender.context === "background",
      "Message didnt come from background"
    );
    return cb(message);
  });
};
