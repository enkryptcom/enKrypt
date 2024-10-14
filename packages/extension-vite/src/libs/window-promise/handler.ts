import { onMounted, reactive, ref, Ref, UnwrapNestedRefs } from "vue";
import {
  newWindowOnMessageFromBackground,
  sendToBackgroundFromNewWindow,
} from "@/libs/messenger/extension";
import {
  ProviderRPCRequest,
  ProviderRequestOptions,
  ProviderName,
} from "@/types/provider";
import { Destination, InternalOnMessageResponse } from "@/types/messenger";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import type { WindowPromiseType } from "@/types/ui";
import { getCustomError } from "@/libs/error";
import { RPCRequestType } from "@enkryptcom/types";

export default (paramCount: number): Promise<WindowPromiseType> => {
  let PromResolve: (val: WindowPromiseType) => void;
  const RetPromise: Promise<WindowPromiseType> = new Promise((resolve) => {
    PromResolve = resolve;
  });
  const options: UnwrapNestedRefs<ProviderRequestOptions> = reactive({
    url: "",
    domain: "",
    faviconURL: "",
    title: "",
    tabId: 0,
  });
  const PromiseResolve: Ref<(res: InternalOnMessageResponse) => void> = ref(
    () => {
      throw "window-promise-handler: not implemented";
    }
  );
  const Request: Ref<ProviderRPCRequest> = ref({ method: "", value: "" });
  const KeyRing: PublicKeyRing = new PublicKeyRing();

  const sendToBackground = (
    req: RPCRequestType
  ): Promise<InternalOnMessageResponse> => {
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
  onMounted(() => {
    history.pushState(null, "", window.location.href);
    history.back();
    window.onpopstate = () => history.forward();
    // prevents browser back button

    newWindowOnMessageFromBackground(
      (message): Promise<InternalOnMessageResponse> => {
        if (
          message.sender.context !== Destination.background ||
          message.provider !== ProviderName.enkrypt
        ) {
          return Promise.resolve({
            error: getCustomError(
              "window-promise-handler: invalid message sender"
            ),
          });
        }
        const RPCRequest = JSON.parse(message.message) as ProviderRPCRequest;
        if (
          paramCount > 0 &&
          (!RPCRequest.params || RPCRequest.params.length !== paramCount)
        ) {
          return Promise.resolve({
            error: getCustomError(
              "window-promise-handler: invalid number of params"
            ),
          });
        }
        options.domain = RPCRequest.options?.domain as string;
        options.url = RPCRequest.options?.url as string;
        options.faviconURL = RPCRequest.options?.faviconURL as string;
        options.title = RPCRequest.options?.title as string;
        Request.value = RPCRequest;
        PromResolve({
          KeyRing,
          Request,
          options,
          sendToBackground,
          Resolve: PromiseResolve,
        });
        return new Promise((resolve) => {
          PromiseResolve.value = resolve;
        });
      }
    );
  });
  return RetPromise;
};
