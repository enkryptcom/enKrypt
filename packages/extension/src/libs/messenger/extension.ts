import {
  onMessage,
  sendMessage,
  allowWindowMessaging,
} from "@enkryptcom/extension-bridge";
import { EXTENSION_NAMESPACE } from "@/configs/constants";
import {
  Message,
  MessageType,
  Response,
  Destination,
  onMessgeType,
} from "@/types/messenger";
import assert from "assert";

export const sendToWindow = (
  type: MessageType,
  message: Message,
  tabId: number
): Promise<Response> => {
  return sendMessage(type, message, `${Destination.window}@${tabId}`).then(
    (res) => res as unknown as Response
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
    return cb(msg);
  });
};
