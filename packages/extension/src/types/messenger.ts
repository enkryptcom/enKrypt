export enum MessageType {
  REQUEST = "enkrypt_request",
}
export enum Destination {
  contentScript = "content-script",
  background = "background",
  window = "window",
}
export enum Provider {
  ethreum = "ethereum",
}
export interface Message {
  [key: string]: string;
  provider: Provider;
  message: string;
}
export interface Response {
  result: string;
  error?: Error;
}

export type onMessgeType = (messge: Message) => Promise<Response>;
