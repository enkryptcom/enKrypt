import { createWasm } from '@polkadot/wasm-crypto-init/asm';
import { initBridge } from '@polkadot/wasm-crypto/init';

if (__IS_SAFARI__) {
  // initBridge(createWasm);
}
