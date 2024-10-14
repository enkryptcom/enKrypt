export default (page: string, namespace: string): string => {
  return `index.html#/${namespace}/${page}`;
};
