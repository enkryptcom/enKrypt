import {
  setNamespace,
  onMessage,
  sendMessage,
} from "@enkryptcom/extension-bridge/dist/window";
import { EXTENSION_NAMESPACE } from "@/configs/constants";
import {
  Message,
  SendMessage,
  MessageType,
  Response,
  Destination,
  onMessgeType,
} from "@/types/messenger";
import { assert } from "chai";

export const sendToBackgroundFromWindow = (
  type: MessageType,
  message: SendMessage
): Promise<Response> => {
  return sendMessage(type, message, Destination.background).then(
    (res) => res as unknown as Response
  );
};

export const setWindowNamespace = (): void => {
  setNamespace(EXTENSION_NAMESPACE);
};

export const windowOnMessage = (type: MessageType, cb: onMessgeType): void => {
  onMessage(type, async (message) => {
    assert(
      message.sender.context === "background",
      "Message didnt come from background"
    );
    const msg = message.data as Message;
    msg.sender = message.sender;
    return cb(msg);
  });
};
