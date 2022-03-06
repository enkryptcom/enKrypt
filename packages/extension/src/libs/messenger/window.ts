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
  Destination,
  onMessageType,
} from "@/types/messenger";
import { OnMessageResponse } from "@enkryptcom/types";
import { ProviderName } from "@/types/provider";
import { assert } from "chai";

export const sendToBackgroundFromWindow = (
  message: SendMessage
): Promise<OnMessageResponse> => {
  return sendMessage(
    MessageType.WINDOW_REQUEST,
    message,
    Destination.background
  ).then((res) => res as unknown as OnMessageResponse);
};

export const providerSendMessage = (
  provider: ProviderName,
  message: string
): Promise<any> => {
  return sendToBackgroundFromWindow({
    provider: provider,
    message: message,
  }).then((res) => {
    if (res.error) return Promise.reject(JSON.parse(res.error));
    else return JSON.parse(res.result as string);
  });
};
export const setWindowNamespace = (): void => {
  setNamespace(EXTENSION_NAMESPACE);
};

export const windowOnMessage = (cb: onMessageType): void => {
  onMessage(MessageType.WINDOW_REQUEST, async (message) => {
    assert(
      message.sender.context === "background",
      "Message didnt come from background"
    );
    const msg = message.data as Message;
    msg.sender = message.sender;
    return cb(msg);
  });
};
