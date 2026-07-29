export const createAsyncLock = () => {
  let tail: Promise<unknown> = Promise.resolve();

  const run = <T>(fn: () => Promise<T>): Promise<T> => {
    const result = tail.catch(() => undefined).then(fn);
    tail = result.catch(() => undefined);
    return result;
  };

  return { run };
};
