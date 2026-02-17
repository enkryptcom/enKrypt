export const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  const truthy: T[] = [];
  const falsy: T[] = [];

  for (const item of array) {
    (predicate(item) ? truthy : falsy).push(item);
  }

  return [truthy, falsy];
}
