import type { JsonValue } from "type-fest";
import { Runtime } from "webextension-polyfill";
import { serializeError } from "serialize-error";
import uuid from "tiny-uid";
import {
  RuntimeContext,
  OnMessageCallback,
  IQueuedMessage,
  IInternalMessage,
  IBridgeMessage,
} from "../types";

export const context: RuntimeContext = "window";

const runtimeId: string = uuid();
export const openTransactions = new Map<
  string,
  {
    resolve: (v: void | JsonValue | PromiseLike<JsonValue>) => void;
    reject: (e: JsonValue) => void;
  }
>();
export const onMessageListeners = new Map<
  string,
  OnMessageCallback<JsonValue>
>();
const messageQueue = new Set<IQueuedMessage>();
const portMap = new Map<string, Runtime.Port>();

const port: Runtime.Port = null;

// these facilitate communication with window contexts ("injected scripts")
let namespace: string;
let isWindowMessagingAllowed: boolean;

export const setNamespace = (nsps: string): void => {
  namespace = nsps;
};

export const allowWindowMessaging = (nsps: string): void => {
  isWindowMessagingAllowed = true;
  namespace = nsps;
};
const handleInboundMessage = async (
  message: IInternalMessage
): Promise<void> => {
  const { transactionId, messageID, messageType } = message;

  const handleReply = () => {
    const transactionP = openTransactions.get(transactionId);
    if (transactionP) {
      const { err, data } = message;
      if (err) {
        const dehydratedErr = err as Record<string, string>;
        const errCtr = self[dehydratedErr.name] as any;
        const hydratedErr = new (typeof errCtr === "function" ? errCtr : Error)(
          dehydratedErr.message
        );
        Object.keys(dehydratedErr).forEach((prop) => {
          hydratedErr[prop] = dehydratedErr[prop];
        });
        transactionP.reject(hydratedErr);
      } else {
        transactionP.resolve(data);
      }
      openTransactions.delete(transactionId);
    }
  };

  const handleNewMessage = async () => {
    let reply: JsonValue | void;
    let err: Error;
    let noHandlerFoundError = false;

    try {
      const cb = onMessageListeners.get(messageID);
      if (typeof cb === "function") {
        reply = await cb({
          sender: message.origin,
          id: messageID,
          data: message.data,
          timestamp: message.timestamp,
        } as IBridgeMessage<JsonValue>);
      } else {
        noHandlerFoundError = true;
        throw new Error(
          `[webext-bridge] No handler registered in '${context}' to accept messages with id '${messageID}'`
        );
      }
    } catch (error) {
      err = error;
    } finally {
      if (err) message.err = serializeError(err);

      routeMessage({
        ...message,
        messageType: "reply",
        data: reply,
        origin: { context, tabId: null },
        destination: message.origin,
        hops: [],
      });

      if (err && !noHandlerFoundError)
        // eslint-disable-next-line no-unsafe-finally
        throw reply;
    }
  };
  switch (messageType) {
    case "reply":
      return handleReply();
    case "message":
      return handleNewMessage();
    default:
      throw new Error("unknown message type");
  }
};

const initIntercoms = () => {
  window.addEventListener("message", handleWindowOnMessage);
};

initIntercoms();

export const routeMessage = (
  message: IInternalMessage
): void | Promise<void> => {
  const { origin, destination } = message;

  if (message.hops.includes(runtimeId)) return;

  message.hops.push(runtimeId);

  // if previous hop removed the destination before forwarding the message, then this itself is the recipient
  if (!destination) {
    handleInboundMessage(message);
    return;
  }

  if (destination.context) {
    if (context === "window") {
      routeMessageThroughWindow(window, message);
    } else if (
      context === "content-script" &&
      destination.context === "window"
    ) {
      message.destination = null;
      routeMessageThroughWindow(window, message);
    } else if (
      ["devtools", "content-script", "popup", "options"].includes(context)
    ) {
      if (destination.context === "background") message.destination = null;
      port.postMessage(message);
    } else if (context === "background") {
      const {
        context: destName,
        tabId: destTabId,
        frameId: destFrameId,
      } = destination;
      const { tabId: srcTabId } = origin;

      // remove the destination in case the message isn't going to `window`; it'll be forwarded to either `content-script` or `devtools`...
      if (destName !== "window") {
        message.destination = null;
      } else {
        // ...however if it is directed towards window, then patch the destination before handing the message off to the `content-script` in
        // the same tab. since `content-script` itself doesn't know it's own tab id, a destination like `window@144` is meaningless to the
        // `content-script` and it'll crap out as it would think it belongs to some other window and will pass it back to background page
        message.destination.tabId = null;
      }

      // As far as background page is concerned, it just needs to know the which `content-script` or `devtools` should it forward to

      let resolvedDestination = ["popup", "options"].includes(destName)
        ? destName
        : `${destName === "window" ? "content-script" : destName}@${
            destTabId || srcTabId
          }`;

      // Here it is checked if a specific frame needs to receive the message
      if (destFrameId)
        resolvedDestination = `${resolvedDestination}.${destFrameId}`;

      const destPort = portMap.get(resolvedDestination);

      if (destPort) destPort.postMessage(message);
      else messageQueue.add({ resolvedDestination, message });
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const assertInternalMessage: (x: unknown) => asserts x = (
  _msg: any
): asserts _msg is IInternalMessage => {
  // todo
};

async function handleWindowOnMessage({ data, ports }: MessageEvent) {
  if (context === "content-script" && !isWindowMessagingAllowed) return;

  if (
    data.cmd === "__crx_bridge_verify_listening" &&
    data.scope === namespace &&
    data.context !== context
  ) {
    const msgPort: MessagePort = ports[0];
    msgPort.postMessage(true);
  } else if (
    data.cmd === "__crx_bridge_route_message" &&
    data.scope === namespace &&
    data.context !== context
  ) {
    const { payload } = data;
    assertInternalMessage(payload);
    // a message event inside `content-script` means a script inside `window` dispatched it
    // so we're making sure that the origin is not tampered (i.e script is not masquerading it's true identity)
    if (context === "content-script") {
      payload.origin = {
        context: "window",
        tabId: null,
      };
    }

    routeMessage(payload);
  }
}

const routeMessageThroughWindow = (win: Window, msg: IInternalMessage) => {
  ensureNamespaceSet();

  const channel = new MessageChannel();
  const retry = setTimeout(() => {
    channel.port1.onmessage = null;
    routeMessageThroughWindow(win, msg);
  }, 300);
  channel.port1.onmessage = () => {
    clearTimeout(retry);
    win.postMessage(
      {
        cmd: "__crx_bridge_route_message",
        scope: namespace,
        context,
        payload: msg,
      },
      "*"
    );
  };
  win.postMessage(
    {
      cmd: "__crx_bridge_verify_listening",
      scope: namespace,
      context,
    },
    "*",
    [channel.port2]
  );
};

function ensureNamespaceSet() {
  if (typeof namespace !== "string" || namespace.length === 0) {
    throw new Error(
      'webext-bridge uses window.postMessage to talk with other "window"(s), for message routing and stuff,' +
        "which is global/conflicting operation in case there are other scripts using webext-bridge. " +
        "Call Bridge#setNamespace(nsps) to isolate your app. Example: setNamespace('com.facebook.react-devtools'). " +
        "Make sure to use same namespace across all your scripts whereever window.postMessage is likely to be used`"
    );
  }
}

export function getCurrentContext() {
  return context;
}
