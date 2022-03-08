import { sendToBackgroundFromNewWindow } from "../messenger/extension";
import { ProviderName } from "@/types/provider";
import { RPCRequestType } from "@enkryptcom/types";
import { InternalOnMessageResponse } from "@/types/messenger";
export default (req: RPCRequestType): Promise<InternalOnMessageResponse> => {
  return sendToBackgroundFromNewWindow({
    provider: ProviderName.enkrypt,
    message: JSON.stringify(req),
  }).then((response) => {
    if (response.error) return response;
    else
      return {
        result: JSON.parse(response.result as string),
      };
  });
};
