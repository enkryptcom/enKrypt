<!-- eslint-disable prettier/prettier -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    text-rendering="geometricPrecision"
    shape-rendering="geometricPrecision"
    style="white-space: pre"
  >
    <ellipse
      id="back"
      rx="5"
      ry="5"
      stroke="#05C0A5"
      fill="none"
      stroke-width="2"
      stroke-linejoin="round"
      opacity="0.2"
      transform="translate(8,8)"
    />
    <ellipse
      id="spin"
      rx="5"
      ry="5"
      stroke="#05C0A5"
      fill="none"
      stroke-width="2"
      stroke-linejoin="round"
      stroke-dasharray="25 20"
      stroke-linecap="round"
      stroke-dashoffset="0"
      stroke-miterlimit="4"
      transform="translate(8,8)"
      style="animation: 3.5s linear infinite both spin_t, 3.5s linear infinite both spin_da"
    />
  </svg>
</template>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
}
</style>

<style>
@keyframes spin_t {
  0% {
    transform: translate(8px, 8px) rotate(0deg);
  }
  42.8571% {
    transform: translate(8px, 8px) rotate(720deg);
  }
  71.4285% {
    transform: translate(8px, 8px) rotate(1080deg);
  }
  100% {
    transform: translate(8px, 8px) rotate(1440deg);
  }
}
@keyframes spin_da {
  0% {
    stroke-dasharray: 25px 20px;
  }
  42.8571% {
    stroke-dasharray: 5px 31px;
  }
  100% {
    stroke-dasharray: 25px 20px;
  }
}
</style>
