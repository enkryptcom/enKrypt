/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { expect } from "chai";
import { SignerType } from "@enkryptcom/types";
import Signer from "../src";

describe("Polkadot Address generate", () => {
  // the tests container
  const MNEMONIC =
    "error fish boy absent drop next ice keep meadow little air include";
  const PHRASE =
    "bottom drive obey lake curtain smoke basket hold race lonely fit walk";

  it("sr25519 addresses should work", async () => {
    const signer = new Signer(SignerType.sr25519);
    for (const bool of [true, false]) {
      let keypair = await signer.generate(MNEMONIC, "//0", { onlyJS: bool });
      expect(keypair.address).equals(
        "5FqSRmrJGMEdb5xk58k6x9RUw7Ri9oEKckDApupjMDysDrZL"
      );
      keypair = await signer.generate(MNEMONIC, "//1", { onlyJS: bool });
      expect(keypair.address).equals(
        "5F2NJSfSZ1ZtUiHXKc3XLKY6SwU3Y1jVw4CD2mKW4okBHNnx"
      );
      keypair = await signer.generate(MNEMONIC, "//0//0", { onlyJS: bool });
      expect(keypair.address).equals(
        "5GKwdnFRMxHP8hTjPY39eF88oCzoUQURawFpx2sJhCMCP15D"
      );
    }
    const list = [
      {
        pk: "0x46ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a",
        ss: "5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV",
        uri: "",
      },
      {
        pk: "0xb69355deefa7a8f33e9297f5af22e680f03597a99d4f4b1c44be47e7a2275802",
        ss: "5GC6LfpV352HtJPySfAecb5JdePtf4R9Vq49NUU8RhzgBqgq",
        uri: `///password`,
      },
      {
        pk: "0x40b9675df90efa6069ff623b0fdfcf706cd47ca7452a5056c7ad58194d23440a",
        ss: "5DXZzrDxHbkQov4QBAY4TjpwnHCMrKXkomTnKSw8UArBEY5v",
        uri: `/foo`,
      },
      {
        pk: "0x547d4a55642ec7ebadc0bd29b6e570b8c926059b3c0655d4948075e9a7e6f31e",
        ss: "5DyV6fZuvPemWrUqBgWwTSgoV86w6xms3KhkFU6cQcWxU8eP",
        uri: `//foo`,
      },
      {
        pk: "0x3841947ffcde6f5fef26fb68b59bb8665637e30e32ec2051f99cf6b9c674fe09",
        ss: "5DLU27is5iViNopQb2KxsTyPx6j4vCu8X3sk3j3NNLkPCqKM",
        uri: `//foo/bar`,
      },
      {
        pk: "0xdc142f7476a7b0aa262aeccf207f1d18daa90762db393006741e8a31f39dbc53",
        ss: "5H3GPTqDSpjkfDwbHy12PD6BWm8jvGSX4xYC8UMprHpTPcRg",
        uri: `/foo//bar`,
      },
      {
        pk: "0xa2e56b06407a6d1e819d2fc33fa0ec604b29c2e868b70b3696bb049b8725934b",
        ss: "5FkHmNgbg64MwStgCyDi2Uw3ufFu11mqQgmWT9uwK4Lghvpv",
        uri: `//foo/bar//42/69`,
      },
      {
        pk: "0x0e0d24e3e1ff2c07f269c99e2e0df8681fda1851ac42fc846ca2daaa90cd8f14",
        ss: "5CP8S23JBNXYNpJsL7ESPJBNnUZE6itcfM4EnDxEhaVEU6dT",
        uri: `//foo/bar//42/69///password`,
      },
      {
        pk: "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",
        ss: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        uri: `//Alice`,
      },
    ];
    for (const item of list) {
      for (const bool of [true, false]) {
        const keypair = await signer.generate(PHRASE, item.uri, {
          onlyJS: bool,
        });
        expect(keypair.address).equals(item.ss);
      }
    }
  }).timeout(5000);
  it("ecdsa addresses should work", async () => {
    const signer = new Signer(SignerType.ecdsa);
    for (const bool of [true, false]) {
      let keypair = await signer.generate(PHRASE, "//Alice", { onlyJS: bool });
      expect(keypair.address).equals(
        "5C7C2Z5sWbytvHpuLTvzKunnnRwQxft1jiqrLD5rhucQ5S9X"
      );
      keypair = await signer.generate(PHRASE, "//0", { onlyJS: bool });
      expect(keypair.address).equals(
        "5EYLKPDaH7gGuon5vesr5QX8S9c22wYvgWwdRoGj3FykwoE8"
      );
      keypair = await signer.generate(PHRASE, "", { onlyJS: bool });
      expect(keypair.address).equals(
        "5GKyBtzbxKU1qjhZrKpMiwtJj7o6jJcXbKQVtYq74DCPerXN"
      );
    }
  });
  it("ed25519 addresses should work", async () => {
    const signer = new Signer(SignerType.ed25519);
    for (const bool of [true, false]) {
      let keypair = await signer.generate(PHRASE, "//Alice", { onlyJS: bool });
      expect(keypair.address).equals(
        "5FA9nQDVg267DEd8m1ZypXLBnvN7SFxYwV7ndqSYGiN9TTpu"
      );
      keypair = await signer.generate(PHRASE, "//0", { onlyJS: bool });
      expect(keypair.address).equals(
        "5HrCphkqYygSXWt9rHebqaqbfEYekhzjyjQNjZiPxpb3XsKY"
      );
      keypair = await signer.generate(PHRASE, "", { onlyJS: bool });
      expect(keypair.address).equals(
        "5DFJF7tY4bpbpcKPJcBTQaKuCDEPCpiz8TRjpmLeTtweqmXL"
      );
    }
  });
});
