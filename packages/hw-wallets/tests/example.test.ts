import { describe, it, expect } from "vitest";

describe("Simple addition", () => {
  // the tests container
  it("it should properly add", async () => {
    expect(1 + 2).to.be.equals(3);
  });
});
