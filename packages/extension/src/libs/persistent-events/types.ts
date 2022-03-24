import { Message } from "@/types/messenger";
import { OnMessageResponse } from "@enkryptcom/types";

export interface IPersistentEvent {
  event: Message;
  response: OnMessageResponse;
}
export enum StorageKeys {
  events = "events",
}
