import { createNanoEvents } from "nanoevents";
const eventBus = createNanoEvents();
const EventBusEmit = (key: string, message: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    eventBus.emit(key, message, (err: Error, res: any) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};
const EventBusOn = (key: string, cb: (message: any) => Promise<any>) => {
  eventBus.on(
    key,
    (message: any, ebCB: (err: Error | null, res?: any) => void) => {
      cb(message)
        .then((res) => ebCB(null, res))
        .catch((err) => ebCB(err));
    }
  );
};

export { EventBusEmit, EventBusOn };
