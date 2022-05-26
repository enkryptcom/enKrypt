import Transport from "@ledgerhq/hw-transport";
import { TransportMessage, WalletType } from "../types";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import Browser from "webextension-polyfill";

export default class LedgerExtensionTransport extends Transport {
  constructor() {
    super();
  }

  static isSupported = (): Promise<boolean> => Promise.resolve(true);

  static list = (): Promise<string[]> => Promise.resolve([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static listen = (_observer: unknown) => ({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unsubscribe: () => {},
  });

  static async open(): Promise<Transport> {
    return new LedgerExtensionTransport();
  }

  async exchange(apdu: Buffer): Promise<Buffer> {
    const apduHex = bufferToHex(apdu);
    return Browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        return Browser.tabs
          .sendMessage(
            tabs[0].id as number,
            { msg: apduHex, wallet: WalletType.ledger } as TransportMessage
          )
          .then((msg) => {
            return hexToBuffer(msg);
          });
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setScrambleKey() {}

  close(): Promise<void> {
    return Promise.resolve();
  }
}
