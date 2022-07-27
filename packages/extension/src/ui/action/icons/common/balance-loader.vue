<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 18"
    text-rendering="geometricPrecision"
    shape-rendering="geometricPrecision"
    style="white-space: pre"
  >
    <defs>
      <linearGradient
        id="Gradient-0"
        x1="100"
        y1="9"
        x2="0"
        y2="9"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="0.41" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="0.595" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <mask id="Mask-1">
        <rect
          width="100"
          height="18"
          fill="#ffffff"
          rx="4"
          stroke="none"
          transform="translate(12,6.5) translate(-12,-6.5)"
        />
      </mask>
    </defs>

    <g mask="url(#Mask-1)">
      <rect
        width="100"
        height="18"
        fill="#000000"
        stroke="none"
        fill-opacity="1"
        opacity="0.05"
        transform="translate(57.5,9.5) translate(-57.5,-9.5)"
      />
      <rect
        width="100"
        height="18"
        fill="url(#Gradient-0)"
        rx="0"
        stroke="none"
        transform="translate(-71,7) translate(-29,-7)"
        style="animation: 1.5s linear infinite both a0_t"
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
@keyframes a0_t {
  0% {
    transform: translate(-100px, 0px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  }
  100% {
    transform: translate(100px, 0px);
  }
}
</style>
