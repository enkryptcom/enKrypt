export default ({
  suppressScrollX = false,
  suppressScrollY = false,
  wheelPropagation = false,
}) => {
  return {
    suppressScrollY,
    suppressScrollX,
    wheelPropagation,
  };
};
