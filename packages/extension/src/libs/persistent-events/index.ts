import { Message } from "@/types/messenger";
import { InternalStorageNamespace } from "@/types/provider";
import { OnMessageResponse } from "@enkryptcom/types";
import BrowserStorage from "../common/browser-storage";
import { IPersistentEvent, StorageKeys } from "./types";
class PersistentEvents {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(
      InternalStorageNamespace.persistentEvents
    );
  }
  async addEvent(
    tabId: number,
    event: Message,
    response: OnMessageResponse
  ): Promise<void> {
    const parsedCurrentEvents: IPersistentEvent[] = await this.getEvents(tabId);
    parsedCurrentEvents.push({
      event,
      response,
    });
    const allEvents = await this.getAllEvents();
    allEvents[tabId] = parsedCurrentEvents;
    await this.#storage.set(StorageKeys.events, allEvents);
  }
  async getEvents(tabId: number): Promise<IPersistentEvent[]> {
    const allEvents = await this.getAllEvents();
    const parsedCurrentEvents: IPersistentEvent[] = allEvents[tabId]
      ? allEvents[tabId]
      : [];
    return parsedCurrentEvents;
  }
  async deleteEvents(tabId: number): Promise<void> {
    const allEvents = await this.getAllEvents();
    if (allEvents[tabId]) {
      delete allEvents[tabId];
      await this.#storage.set(StorageKeys.events, allEvents);
    }
  }
  async deleteAllEvents(): Promise<void> {
    return await this.#storage.remove(StorageKeys.events);
  }
  async getAllEvents(): Promise<Record<number, IPersistentEvent[]>> {
    const allEvents = await this.#storage.get(StorageKeys.events);
    if (!allEvents) return {};
    return allEvents;
  }
}
export default PersistentEvents;
