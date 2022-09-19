export const getTLD = (name: string): string => {
  const labels = name.split(".");
  if (labels.length < 2) return "";
  return labels[labels.length - 1];
};
