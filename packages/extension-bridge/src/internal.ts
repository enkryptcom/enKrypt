import type { JsonValue } from "type-fest";
import browser, { Runtime } from "webextension-polyfill";
import { serializeError } from "serialize-error";
import uuid from "tiny-uid";
import {
  RuntimeContext,
  OnMessageCallback,
  IQueuedMessage,
  IInternalMessage,
  IBridgeMessage,
} from "./types";
import { hasAPI, parseEndpoint, getBackgroundPageType } from "./utils";

export const context: RuntimeContext = hasAPI("devtools")
  ? "devtools"
  : hasAPI("tabs")
  ? getBackgroundPageType()
  : hasAPI("extension")
  ? "content-script"
  : typeof document !== "undefined"
  ? "window"
  : null;

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

let port: Runtime.Port = null;

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
  if (context === null)
    throw new Error(
      "Unable to detect runtime context i.e webext-bridge can't figure out what to do"
    );

  if (context === "window" || context === "content-script")
    window.addEventListener("message", handleWindowOnMessage);

  if (context === "content-script") {
    // support for manifest v3
    const connectToBackgroundWithDisconnect = () => {
      port = browser.runtime.connect();
      port.onMessage.addListener((message: IInternalMessage) => {
        routeMessage(message);
      });
      port.onDisconnect.addListener(() => {
        port = null;
        initIntercoms();
      });
    };
    connectToBackgroundWithDisconnect();
  }

  if (context === "devtools") {
    const { tabId } = browser.devtools.inspectedWindow;
    const name = `devtools@${tabId}`;
    const connectToBackgroundWithDisconnect = () => {
      port = browser.runtime.connect({ name });
      port.onMessage.addListener((message: IInternalMessage) => {
        routeMessage(message);
      });
      port.onDisconnect.addListener(() => {
        port = null;
        initIntercoms();
      });
    };
    connectToBackgroundWithDisconnect();
  }

  if (
    context === "popup" ||
    context === "options" ||
    context === "new-window"
  ) {
    const name = `${context}`;
    const connectToBackgroundWithDisconnect = () => {
      port = browser.runtime.connect({ name });
      port.onMessage.addListener((message: IInternalMessage) => {
        routeMessage(message);
      });
      port.onDisconnect.addListener(() => {
        port = null;
        initIntercoms();
      });
    };
    connectToBackgroundWithDisconnect();
  }

  if (context === "background") {
    browser.runtime.onConnect.addListener((incomingPort) => {
      // when coming from devtools, it's should pre-fabricated with inspected tab as linked tab id

      let portId =
        incomingPort.name || `content-script@${incomingPort.sender.tab.id}`;
      if (portId === "new-window")
        portId = `new-window@${incomingPort.sender.tab.id}`;

      const portFrame = incomingPort.sender.frameId;

      if (portFrame) portId = `${portId}.${portFrame}`;

      // literal tab id in case of content script, however tab id of inspected page in case of devtools context
      const { context: _context, tabId: linkedTabId } = parseEndpoint(portId);
      // in-case the port handshake is from something else
      if (
        !linkedTabId &&
        _context !== "popup" &&
        _context !== "options" &&
        _context !== "new-window"
      )
        return;
      portMap.set(portId, incomingPort);

      messageQueue.forEach((queuedMsg) => {
        if (queuedMsg.resolvedDestination === portId) {
          incomingPort.postMessage(queuedMsg.message);
          messageQueue.delete(queuedMsg);
        }
      });
      incomingPort.onDisconnect.addListener(() => {
        portMap.delete(portId);
        incomingPort = null;
      });
      if (chrome) {
        setTimeout(() => {
          if (incomingPort) {
            portMap.delete(portId);
            incomingPort.disconnect();
            incomingPort = null;
          }
        }, 250e3); // on chrome force reconnect as this is a way of keeping the background running forever //https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
      }
      incomingPort.onMessage.addListener((message: IInternalMessage) => {
        if (message?.origin?.context) {
          // origin tab ID is resolved from the port identifier (also prevent "MITM attacks" of extensions)
          message.origin.tabId = linkedTabId;
          if (portFrame) message.origin.frameId = portFrame;
          routeMessage(message);
        }
      });
    });
    if (chrome) {
      setInterval(chrome.runtime.getPlatformInfo, 20e3); // on chrome force reconnect as this is a way of keeping the background running forever //https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
    }
  }
};

initIntercoms();
export const routeMessage = (
  message: IInternalMessage
): void | Promise<void> => {
  const { origin, destination } = message;
  if (message.hops.includes(runtimeId)) return;

  message.hops.push(runtimeId);

  if (
    context === "content-script" &&
    [destination, origin].some((endpoint) => endpoint?.context === "window") &&
    !isWindowMessagingAllowed
  )
    return;

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
      ["devtools", "content-script", "popup", "options", "new-window"].includes(
        context
      )
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
    const payload = { ...data.payload };
    assertInternalMessage(payload);
    // a message event inside `content-script` means a script inside `window` dispatched it
    // so we're making sure that the origin is not tampered (i.e script is not masquerading it's true identity)
    if (context === "content-script") {
      payload.origin = {
        context: "window",
        tabId: null,
      };
      if (payload.destination.context === "content-script")
        delete payload.destination;
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
