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
  onMessgeType,
} from "@/types/messenger";
import { OnMessageResponse } from "@enkryptcom/types";
import { Provider } from "@/types/provider";
import { assert } from "chai";

export const sendToBackgroundFromWindow = (
  type: MessageType,
  message: SendMessage
): Promise<OnMessageResponse> => {
  return sendMessage(type, message, Destination.background).then(
    (res) => res as unknown as OnMessageResponse
  );
};

export const providerSendMessage = (
  provider: Provider,
  message: string
): Promise<any> => {
  return sendToBackgroundFromWindow(MessageType.REQUEST, {
    provider: provider.name,
    message: message,
  }).then((res) => {
    if (res.error) return Promise.reject(JSON.parse(res.error));
    else return JSON.parse(res.result as string);
  });
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
