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
  type: MessageType,
  message: SendMessage,
  tabId: number
): Promise<OnMessageResponse> => {
  return sendMessage(type, message, `${Destination.window}@${tabId}`).then(
    (res) => res as unknown as OnMessageResponse
  );
};

export const setContentScriptNamespace = (): void => {
  allowWindowMessaging(EXTENSION_NAMESPACE);
};

export const backgroundOnMessage = (
  type: MessageType,
  cb: onMessgeType
): void => {
  onMessage(type, async (message) => {
    assert(
      message.sender.context === "window" || message.sender.context === "popup",
      "Message didnt come from window or popup"
    );
    const msg = message.data as Message;
    msg.sender = message.sender;
    return cb(msg);
  });
};
export const backgroundOnMessageFromWindow = (
  type: MessageType,
  cb: onMessgeType
): void => {
  backgroundOnMessage(type, async (message) => {
    assert(
      message.sender.context === "window",
      "Message didnt come from window"
    );
    return cb(message);
  });
};
