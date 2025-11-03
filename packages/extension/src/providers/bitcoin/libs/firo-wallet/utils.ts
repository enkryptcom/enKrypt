export const chunkedEvery = (
  data: any[],
  chunksize: number,
  callback: (data: any, index?: number) => void,
  finished: () => void,
) => {
  let i = 0;
  (function chunk() {
    const end = Math.min(i + chunksize, data.length);
    for (; i < end; ++i) {
      callback(data[i]);
    }
    if (i < data.length) {
      setTimeout(chunk, 0);
    } else {
      finished.call(null);
    }
  })();
};
