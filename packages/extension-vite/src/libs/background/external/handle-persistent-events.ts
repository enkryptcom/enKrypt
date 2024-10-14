import PersistentEvents from "@/libs/persistent-events";
import Browser from "webextension-polyfill";
import { sendToWindow } from "@/libs/messenger/extension";
import { OnMessageResponse } from "@enkryptcom/types";
import { EnkryptProviderEventMethods } from "@/types/provider";
import type BackgroundHandler from "..";

async function handlePersistentEvents(this: BackgroundHandler) {
  const persistentEvents = new PersistentEvents();
  const allPersistentEvents = await persistentEvents.getAllEvents();
  const tabs = Object.keys(allPersistentEvents).map((s) => parseInt(s));
  const persistentEventPromises: Promise<void>[] = [];
  tabs.forEach((tab) => {
    const tabPromise = Browser.tabs
      .get(tab)
      .then(() => {
        const eventPromises: Promise<OnMessageResponse | undefined>[] = [];
        allPersistentEvents[tab].forEach((persistentEvent) => {
          const promise = this.externalHandler(persistentEvent.event, {
            savePersistentEvents: false,
          }).then((newResponse) => {
            if (
              !newResponse.error &&
              newResponse.result !== persistentEvent.response.result
            ) {
              return sendToWindow(
                {
                  provider: persistentEvent.event.provider,
                  message: JSON.stringify({
                    method: EnkryptProviderEventMethods.persistentEvents,
                    params: [
                      JSON.parse(persistentEvent.event.message),
                      persistentEvent.response.result,
                      newResponse.result,
                    ],
                  }),
                },
                tab
              );
            }
          });
          eventPromises.push(promise);
        });
        return Promise.all(eventPromises);
      })
      .catch(() => {
        persistentEvents.deleteEvents(tab);
      });
    persistentEventPromises.push(tabPromise as any);
  });
  await Promise.all(persistentEventPromises);
}
export default handlePersistentEvents;
