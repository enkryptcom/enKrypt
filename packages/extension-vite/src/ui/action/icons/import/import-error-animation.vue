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
      style="animation: 0.6s linear both a0_t_2, 0.6s linear both a0_s_2, 0.6s linear both a0_da"
    />
    <g
      id="x"
      fill="none"
      opacity="1"
      transform="translate(36,36) translate(-7.5,-7.5)"
    >
      <path
        d="M0,0L-15,15"
        stroke="#f4432c"
        fill="none"
        stroke-linecap="round"
        stroke-width="0"
        transform="translate(7.5,7.5) translate(7.5,-7.5)"
        style="animation: 0.6s linear both a1_sw"
      />
      <path
        d="M0,15L-15,0"
        stroke="#f4432c"
        fill="none"
        stroke-linecap="round"
        stroke-width="0"
        transform="translate(7.5,7.5) translate(7.5,-7.5)"
        style="animation: 0.6s linear both a2_sw"
      />
    </g>
  </svg>
</template>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
}
</style>

<style>
@keyframes a0_t_2 {
  0% {
    transform: translate(36px, 36px) rotate(0deg);
  }
  100% {
    transform: translate(36px, 36px) rotate(30deg);
  }
}
@keyframes a0_s_2 {
  0% {
    stroke: #5f6368;
  }
  16.6667% {
    stroke: #5f6368;
    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  }
  100% {
    stroke: #5f6368;
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
@keyframes a1_sw {
  0% {
    stroke-width: 0px;
  }
  33.3333% {
    stroke-width: 0px;
    animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
  }
  100% {
    stroke-width: 3px;
  }
}
@keyframes a2_sw {
  0% {
    stroke-width: 0px;
  }
  33.3333% {
    stroke-width: 0px;
    animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
  }
  100% {
    stroke-width: 3px;
  }
}
</style>
