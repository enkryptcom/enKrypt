import {
  onMessage,
  sendMessage,
  allowWindowMessaging,
  getCurrentContext,
} from '@enkryptcom/extension-bridge';
import { EXTENSION_NAMESPACE } from '@/configs/constants';
import {
  Message,
  MessageType,
  Destination,
  onMessageType,
  SendMessage,
  InternalMessageType,
  InternalOnMessageResponse,
  ActionSendMessage,
} from '@/types/messenger';
import { OnMessageResponse } from '@enkryptcom/types';
import { EventBusEmit, EventBusOn } from './eventbus';

export { getCurrentContext };
export const sendToWindow = (
  message: SendMessage,
  tabId: number,
): Promise<OnMessageResponse> => {
  const receiverAddress = '0x9858EfFD232B4033E47d90003D41EC34EcaEda94';
  return sendMessage(
    MessageType.WINDOW_REQUEST,
    { ...message, receiverAddress },
    `${Destination.window}@${tabId}`,
  ).then(res => res as unknown as OnMessageResponse);
};

export const setContentScriptNamespace = (): void => {
  allowWindowMessaging(EXTENSION_NAMESPACE);
};

export const sendToBackgroundFromBackground = (
  message: SendMessage,
): Promise<InternalOnMessageResponse> => {
  const receiverAddress = '0x9858EfFD232B4033E47d90003D41EC34EcaEda94';
  return EventBusEmit(MessageType.BACKGROUND_REQUEST, { ...message, receiverAddress }).then(
    res => res as unknown as InternalOnMessageResponse,
  );
};

export const sendToBackgroundFromNewWindow = (
  message: SendMessage,
): Promise<InternalOnMessageResponse> => {
  return sendMessage(
    MessageType.NEWWINDOW_REQUEST,
    message,
    Destination.background,
  ).then(res => res as unknown as InternalOnMessageResponse);
};

export const sendToBackgroundFromAction = (
  message: ActionSendMessage,
): Promise<InternalOnMessageResponse> => {
  return sendMessage(
    MessageType.ACTION_REQUEST,
    message,
    Destination.background,
  ).then(res as unknown as InternalOnMessageResponse);
};

export const sendToBackgroundFromCS = (
  message: SendMessage,
): Promise<InternalOnMessageResponse> => {
  return sendMessage(
    MessageType.CS_REQUEST,
    message,
    Destination.background,
  ).then(res => res as unknown as InternalOnMessageResponse);
};

export const sendToNewWindowFromBackground = (
  message: SendMessage,
  tabId: number,
): Promise<InternalOnMessageResponse> => {
  return sendMessage(
    MessageType.NEWWINDOW_REQUEST,
    message,
    `${Destination.newWindow}@${tabId}`,
  ).then(res => res as unknown as InternalOnMessageResponse);
};

const backgroundOnMessage = (
  type: MessageType,
  cb: onMessageType | InternalMessageType,
): void => {
  onMessage(type, async message => {
    const msg = message.data as Message;
    msg.sender = message.sender;
    return cb(msg);
  });
};

export const backgroundOnMessageFromWindow = (cb: onMessageType): void => {
  backgroundOnMessage(MessageType.WINDOW_REQUEST, message => {
    if (message.sender.context !== Destination.window) {
      throw new Error('Message didnt come from window');
    }
    return cb(message);
  });
};

export const backgroundOnMessageFromNewWindow = (
  cb: InternalMessageType,
): void => {
  backgroundOnMessage(MessageType.NEWWINDOW_REQUEST, async message => {
    if (message.sender.context !== Destination.newWindow) {
      throw new Error('Message didnt come from new-window');
    }
    return cb(message);
  });
};

export const backgroundOnMessageFromAction = (
  cb: InternalMessageType,
): void => {
  backgroundOnMessage(MessageType.ACTION_REQUEST, async message => {
    if (message.sender.context !== Destination.popup) {
      throw new Error('Message didnt come from popup');
    }
    return cb(message);
  });
};

export const backgroundOnMessageFromCS = (cb: onMessageType): void => {
  backgroundOnMessage(MessageType.CS_REQUEST, async message => {
    if (message.sender.context !== Destination.contentScript) {
      throw new Error('Message didnt come from content script');
    }
    return cb(message);
  });
};

export const newWindowOnMessageFromBackground = (
  cb: InternalMessageType,
): void => {
  backgroundOnMessage(MessageType.NEWWINDOW_REQUEST, async message => {
    if (message.sender.context !== Destination.background) {
      throw new Error('Message didnt come from background');
    }
    return cb(message);
  });
};

export const backgroundOnMessageFromBackground = (
  cb: InternalMessageType,
): void => {
  EventBusOn(MessageType.BACKGROUND_REQUEST, async message => {
    return cb(message);
  });
};
