import { describe, it, expect } from "vitest";
import { MemoryStorage } from "@enkryptcom/utils";
import { Storage } from "@enkryptcom/storage";
import KeyRing from "../src";

describe("Keyring locking tests", () => {
  const memStorage = new MemoryStorage();
  const storage = new Storage("keyring", { storage: memStorage });
  const keyring = new KeyRing(storage, 2000);
  const password = "helloworld";
  it(
    "keyring should lock and unlock properly",
    { timeout: 20_000 },
    async function () {
      await keyring.init(password);
      expect(keyring.isLocked()).to.be.equals(true);
      await keyring.unlockMnemonic(password);
      expect(keyring.isLocked()).to.be.equals(false);
      await new Promise<void>(function (res) {
        keyring.lock();
        res();
      });
      expect(keyring.isLocked()).to.be.equals(true);
    },
  );
});
