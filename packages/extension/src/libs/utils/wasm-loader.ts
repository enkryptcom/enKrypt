export declare const Module: any;

declare global {
  interface WasmModule {
    ccall: (
      name: string,
      returnType: any,
      argumentTypes: string[],
      args: any[],
    ) => any;
    _free: (d: any) => any;
    _malloc: (d: number) => any;
    _js_createMintedCoinData: (...args: any) => any;
    _js_createSparkMintRecipients: (...args: any) => any;
    _js_getRecipientVectorLength: (...args: any) => any;
    _js_getRecipientAt: (...args: any) => any;
    _js_getRecipientScriptPubKeySize: (...args: any) => any;
    _js_getRecipientScriptPubKey: (...args: any) => any;
    _js_getRecipientAmount: (...args: any) => any;
    _js_getRecipientSubtractFeeFromAmountFlag: (...args: any) => any;
    UTF8ToString: (...args: any) => any;
    HEAPU8: Uint8Array<ArrayBufferLike>;
    HEAP8: Int8Array<ArrayBufferLike>;
    HEAP16: Int16Array<ArrayBufferLike>;
    HEAPU16: Uint16Array<ArrayBufferLike>;
    HEAP32: Int32Array<ArrayBufferLike>;
    HEAPU32: Uint32Array<ArrayBufferLike>;
    HEAPF32: Float32Array<ArrayBufferLike>;
  }
}

function scriptExists(id: string) {
  return document.getElementById(id);
}

async function loadWasm(): Promise<WasmModule> {
  return new Promise((resolve, reject) => {
    const injectedScript = scriptExists('injected-wasm-js');

    if (injectedScript) {
      injectedScript.onload = async () => {
        if (typeof Module !== 'undefined') {
          resolve(Module);
        } else {
          reject(new Error('Failed to load WASM module.'));
        }
      };
    } else {
      const script = document.createElement('script');
      script.id = 'injected-wasm-js';
      script.src = '/wasm/spark.js';
      script.onload = async () => {
        if (typeof Module !== 'undefined') {
          resolve(Module);
        } else {
          reject(new Error('Failed to load WASM module.'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load WASM script.'));
      document.body.appendChild(script);
    }
  });
}

class WasmInstance {
  instance: WasmModule | null = null;

  constructor() {
    loadWasm()
      .then(module => {
        console.log(module);
        this.instance = module;
      })
      .catch(error => {
        console.error('Error loading WASM module:', error);
      });
  }

  public async getInstance(): Promise<WasmModule> {
    if (this.instance) {
      return Promise.resolve(this.instance);
    } else {
      const wasm = await loadWasm();
      this.instance = wasm;
      return Promise.resolve(wasm);
    }
  }
}

export const wasmInstance = new WasmInstance();
