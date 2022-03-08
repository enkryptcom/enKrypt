import {
  backgroundOnMessageFromWindow,
  backgroundOnMessageFromNewWindow,
} from "@/libs/messenger/extension";
import { InternalOnMessageResponse } from "@/types/messenger";
import { OnMessageResponse } from "@enkryptcom/types";
import BackgroundHandler from "@/libs/background";
const backgroundHandler = new BackgroundHandler();

backgroundOnMessageFromNewWindow(
  async (msg): Promise<InternalOnMessageResponse> => {
    return backgroundHandler.internalHandler(msg);
  }
);
backgroundOnMessageFromWindow(async (msg): Promise<OnMessageResponse> => {
  return backgroundHandler.externalHandler(msg);
});
