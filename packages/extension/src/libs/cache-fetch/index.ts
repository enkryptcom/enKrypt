import { RequestOptions, StoredData } from "./types";
import BrowserStorage from "../common/browser-storage";
import { InternalStorageNamespace } from "@/types/provider";
import { keccak256 } from "web3-utils";
const cacheFetch = async (options: RequestOptions, ttl: number) => {
  const storage = new BrowserStorage(InternalStorageNamespace.cacheFetch);
  const hash = keccak256(options.url);
  const cached: StoredData = await storage.get(hash);
  if (cached && cached.timestamp + ttl > new Date().getTime()) {
    return JSON.parse(cached.data);
  } else {
    return fetch(options.url)
      .then((res) => res.json())
      .then((json) => {
        const store: StoredData = {
          timestamp: new Date().getTime(),
          data: JSON.stringify(json),
        };
        return storage.set(hash, store).then(() => json);
      });
  }
};

export default cacheFetch;
