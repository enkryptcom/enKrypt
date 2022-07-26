<!-- eslint-disable prettier/prettier -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 128 128"
    text-rendering="geometricPrecision"
    shape-rendering="geometricPrecision"
    style="white-space: pre"
  >
    <ellipse
      id="back"
      rx="29"
      ry="29"
      stroke="rgba(104,76,255,0.50)"
      fill="none"
      stroke-width="6"
      stroke-linejoin="round"
      opacity="0.2"
      transform="translate(64,64)"
    />
    <ellipse
      id="spin"
      rx="29"
      ry="29"
      stroke="#684cff"
      fill="none"
      stroke-width="6"
      stroke-linejoin="round"
      stroke-dasharray="130 100"
      stroke-linecap="round"
      stroke-dashoffset="0"
      stroke-miterlimit="4"
      transform="translate(64,64)"
      style="animation: 3.5s linear infinite both spin_tsp, 3.5s linear infinite both spin_dasp"
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
@keyframes spin_tsp {
  0% {
    transform: translate(64px, 64px) rotate(0deg);
  }
  42.8571% {
    transform: translate(64px, 64px) rotate(720deg);
  }
  71.4285% {
    transform: translate(64px, 64px) rotate(1080deg);
  }
  100% {
    transform: translate(64px, 64px) rotate(1440deg);
  }
}
@keyframes spin_dasp {
  0% {
    stroke-dasharray: 130px 100px;
  }
  42.8571% {
    stroke-dasharray: 10px 180px;
  }
  100% {
    stroke-dasharray: 130px 100px;
  }
}
</style>
