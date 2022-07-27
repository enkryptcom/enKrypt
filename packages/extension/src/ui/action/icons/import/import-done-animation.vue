<!-- eslint-disable prettier/prettier -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 72 72"
    text-rendering="geometricPrecision"
    shape-rendering="geometricPrecision"
    style="white-space: pre"
  >
    <ellipse
      rx="35"
      ry="35"
      fill="none"
      stroke="#5f6368"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-dasharray="10"
      stroke-miterlimit="4"
      transform="translate(36,36)"
      style="animation: 0.6s linear both a0_t_1, 0.6s linear both a0_s, 0.6s linear both a0_da"
    />
    <path
      id="done"
      d="M0.63184,-0.721589L7.63184,8.27841L20.6318,-8.72159"
      stroke="#34c759"
      fill="none"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill-rule="nonzero"
      stroke-dasharray="33"
      stroke-dashoffset="33"
      transform="translate(25.3682,37.7216)"
      style="animation: 0.6s linear both done_do"
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
@keyframes a0_t_1 {
  0% {
    transform: translate(36px, 36px) rotate(0deg);
  }
  100% {
    transform: translate(36px, 36px) rotate(30deg);
  }
}
@keyframes a0_s {
  0% {
    stroke: #5f6368;
  }
  16.6667% {
    stroke: #5f6368;
    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  }
  100% {
    stroke: #34c759;
  }
}
@keyframes a0_da {
  0% {
    stroke-dasharray: 10px;
  }
  16.6667% {
    stroke-dasharray: 10px;
    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  }
  100% {
    stroke-dasharray: 20px 0px;
  }
}
@keyframes done_do {
  0% {
    stroke-dashoffset: 33px;
  }
  16.6667% {
    stroke-dashoffset: 33px;
    animation-timing-function: cubic-bezier(0.86, 0, 0.07, 1);
  }
  100% {
    stroke-dashoffset: 0px;
  }
}
</style>
