export const intersectSets = <T>(setA: Set<T>, setB: Set<T>) => {
  const result = new Set<T>();
  for (const item of setA) {
    if (setB.has(item)) {
      result.add(item);
    }
  }
  return result;
};
