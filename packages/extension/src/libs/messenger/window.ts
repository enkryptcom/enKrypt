import {
  setNamespace,
  onMessage,
  sendMessage,
} from "@enkryptcom/extension-bridge/dist/window";
import { EXTENSION_NAMESPACE } from "@/configs/constants";
import {
  Message,
  MessageType,
  Response,
  Destination,
  onMessgeType,
} from "@/types/messenger";
import assert from "assert";

export const sendToBackgroundFromWindow = (
  type: MessageType,
  message: Message
): Promise<Response> => {
  return sendMessage(type, message, Destination.background).then((res) => {
    const strRes = res as string;
    return {
      response: strRes,
    };
  });
};

export const setWindowNamespace = (): void => {
  setNamespace(EXTENSION_NAMESPACE);
};

export const windowOnMessage = (type: MessageType, cb: onMessgeType): void => {
  onMessage(type, async (message) => {
    assert(
      message.sender.context === "background",
      "Message didnt come from backroung"
    );
    const msg = message.data as string;
    cb(msg);
  });
};
