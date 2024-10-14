import { getCustomError } from "@/libs/error";
import { getNetworkByName } from "@/libs/utils/networks";
import { BaseNetwork } from "@/types/base-network";
import {
  ActionSendMessage,
  InternalOnMessageResponse,
  Message,
} from "@/types/messenger";
import { RPCRequestType } from "@enkryptcom/types";
import { TabProviderType } from "../types";

const changeNetwork = async (
  msg: Message,
  tabProviders: TabProviderType
): Promise<InternalOnMessageResponse> => {
  const message = JSON.parse(msg.message) as RPCRequestType;
  if (!message.params || message.params.length < 1)
    return Promise.resolve({
      error: getCustomError("background: invalid params for change network"),
    });
  const networkName = message.params[0] as string;
  const network = (await getNetworkByName(networkName)) as BaseNetwork;
  const actionMsg = msg as any as ActionSendMessage;
  if (
    actionMsg.provider &&
    actionMsg.tabId &&
    tabProviders[actionMsg.provider][actionMsg.tabId]
  ) {
    tabProviders[actionMsg.provider][actionMsg.tabId].setRequestProvider(
      network
    );
  }
  return Promise.resolve({
    result: JSON.stringify(true),
  });
};

export default changeNetwork;
