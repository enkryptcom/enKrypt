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
  response: string;
}

export type onMessgeType = (messge: string) => Promise<Response>;
