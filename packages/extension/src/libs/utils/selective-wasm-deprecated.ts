import { createWasm } from "@polkadot/wasm-crypto-init/asm";
import { initBridge } from "@polkadot/wasm-crypto/init";

if (process.env.IS_MANIFEST_V3) {
  initBridge(createWasm);
}
