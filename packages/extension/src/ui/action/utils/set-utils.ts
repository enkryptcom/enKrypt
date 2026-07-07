export const intersectSets = <T>(set: Set<T>, update: Set<T>) => {
  const result = new Set<T>();
  for (const item of update) {
    if (set.has(item)) {
      result.add(item);
    }
  }
  return result;
};

export const differenceSets = <T>(set: Set<T>, update: Set<T>) => {
  const result = new Set<T>();
  for (const item of update) {
    if (!set.has(item)) {
      result.add(item);
    }
  }
  return result;
};
