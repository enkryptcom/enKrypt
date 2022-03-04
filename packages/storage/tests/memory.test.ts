import { expect } from "chai";
import { MemoryStorage } from "@enkryptcom/utils";
import Storage from "../src";

describe("Storage checker", () => {
  // the tests container
  const memStore = new MemoryStorage();
  const storage1 = new Storage("test-namespace1", { storage: memStore });
  const storage2 = new Storage("test-namespace2", { storage: memStore });
  it("it should properly handle storage operations", async () => {
    expect(await storage1.get("dontexists")).to.equal(null);
    await storage1.set("newObj", { abc: 1, efg: 2 });
    expect(await memStore.getWholeStorage()).to.deep.equal({
      "test-namespace1": { newObj: { abc: 1, efg: 2 } },
    });
    await storage2.set("newObj", { abc: 3, efg: 4 });
    expect(await memStore.getWholeStorage()).to.deep.equal({
      "test-namespace1": { newObj: { abc: 1, efg: 2 } },
      "test-namespace2": { newObj: { abc: 3, efg: 4 } },
    });
    expect(await storage1.get("newObj")).to.deep.equal({ abc: 1, efg: 2 });
    expect(await storage2.get("newObj")).to.deep.equal({ abc: 3, efg: 4 });
    await storage1.set("newObj2", { jkl: 5, xyz: 6 });
    await storage1.remove("newObj");
    expect(await storage1.get("newObj")).to.equal(null);
    expect(await storage1.get("newObj2")).to.deep.equal({ jkl: 5, xyz: 6 });
    await storage1.clear();
    expect(await memStore.getWholeStorage()).to.deep.equal({
      "test-namespace2": { newObj: { abc: 3, efg: 4 } },
    });
  });
});
