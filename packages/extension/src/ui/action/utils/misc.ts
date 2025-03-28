import notfoundimg from '@action/assets/common/not-found.jpg';
export const imageLoadError = (img: any) => {
  img.target.src = notfoundimg;
};
