export declare const Module: any;

async function loadWasm(): Promise<WasmModule> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
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
  });
};



class WasmInstance {
  instance: WasmModule | null = null;

  constructor() {
    loadWasm().then(module => {
      console.log(module)
      this.instance = module
    }).catch(error => {
      console.error('Error loading WASM module:', error);
    });
  }


  public async getInstance(): Promise<WasmModule> {
    console.log('getInstance', this.instance)

    if (this.instance) {
      return Promise.resolve(this.instance);
    } else {
      const wasm = await loadWasm()
      this.instance = wasm;
      return Promise.resolve(wasm);
    }
  }
}

export const wasmInstance = new WasmInstance();
