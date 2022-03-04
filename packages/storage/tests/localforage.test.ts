import { expect } from "chai";
import LocalForageLib from "localforage";
import Storage from "../src";
import LocalForage from "../src/local-forage";
import DummyDriver from "./dummyDriver";

describe("LocalForage storage checker", () => {
  // the tests container
  LocalForageLib.defineDriver(DummyDriver);
  const localForage = new LocalForage("test", [DummyDriver._driver]);
  const storage1 = new Storage("test-namespace1", { storage: localForage });
  const storage2 = new Storage("test-namespace2", { storage: localForage });
  it("it should properly handle storage operations", async () => {
    expect(await storage1.get("dontexists")).to.equal(null);
    await storage1.set("newObj", { abc: 1, efg: 2 });
    expect(await storage1.get("newObj")).to.deep.equal({ abc: 1, efg: 2 });
    await storage2.set("newObj", { abc: 3, efg: 4 });
    expect(await storage1.get("newObj")).to.deep.equal({ abc: 1, efg: 2 });
    expect(await storage2.get("newObj")).to.deep.equal({ abc: 3, efg: 4 });
    await storage1.set("newObj2", { jkl: 5, xyz: 6 });
    await storage1.remove("newObj");
    expect(await storage1.get("newObj")).to.equal(null);
    expect(await storage1.get("newObj2")).to.deep.equal({ jkl: 5, xyz: 6 });
  });
});
