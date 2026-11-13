declare function initSpark(
  moduleArg?: Record<string, unknown>,
): Promise<WasmModule>;

export default initSpark;
