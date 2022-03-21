const regex = /import\.meta/g;
module.exports = function (source) {
  let found = false;
  let rewrittenSource = source.replace(regex, () => {
    found = true;
    return false;
  });
  if (found) {
    return rewrittenSource;
  } else {
    return source;
  }
};
