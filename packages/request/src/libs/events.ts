export class Event {
  public target: any;

  public type: string;

  constructor(type: string, target: any) {
    this.target = target;
    this.type = type;
  }
}

export class ErrorEvent extends Event {
  public message: string;

  public error: Error;

  constructor(error: Error, target: any) {
    super("error", target);
    this.message = error.message;
    this.error = error;
  }
}

export class CloseEvent extends Event {
  public code: number;

  public reason: string;

  public wasClean = true;

  // eslint-disable-next-line default-param-last
  constructor(code = 1000, reason = "", target: any) {
    super("close", target);
    this.code = code;
    this.reason = reason;
  }
}
export interface WebSocketEventMap {
  close: CloseEvent;
  error: ErrorEvent;
  message: MessageEvent;
  open: Event;
}

export interface WebSocketEventListenerMap {
  close: (
    event: CloseEvent
  ) => void | { handleEvent: (localEvent: CloseEvent) => void };
  error: (
    event: ErrorEvent
  ) => void | { handleEvent: (localEvent: ErrorEvent) => void };
  message: (
    event: MessageEvent
  ) => void | { handleEvent: (localEvent: MessageEvent) => void };
  open: (event: Event) => void | { handleEvent: (localEvent: Event) => void };
}
