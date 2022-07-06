import {
  ActionSendMessage,
  InternalOnMessageResponse,
  Message,
} from "@/types/messenger";
import { RPCRequestType } from "@enkryptcom/types";
import { TabProviderType } from "../types";

const sendToTab = (
  msg: Message,
  tabProviders: TabProviderType
): Promise<InternalOnMessageResponse> => {
  const message = JSON.parse(msg.message) as RPCRequestType;
  const actionMsg = msg as any as ActionSendMessage;
  if (
    actionMsg.provider &&
    actionMsg.tabId &&
    tabProviders[actionMsg.provider][actionMsg.tabId]
  ) {
    tabProviders[actionMsg.provider][actionMsg.tabId].sendNotification(
      JSON.stringify(message.params?.length ? message.params[0] : {})
    );
    return Promise.resolve({
      result: JSON.stringify(true),
    });
  } else {
    return Promise.resolve({
      result: JSON.stringify(false),
    });
  }
};

export default sendToTab;
