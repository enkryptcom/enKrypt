<!-- eslint-disable prettier/prettier -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    shape-rendering="geometricPrecision"
    text-rendering="geometricPrecision"
    viewBox="0 0 32 32"
    height="32"
    width="32"
    style="white-space: pre"
  >
    <ellipse
      id="accent.element.0"
      rx="9"
      ry="9"
      stroke="rgba(0,0,0,0.38)"
      fill="none"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.2"
      stroke-dasharray="none"
      transform="translate(16,16)"
    />
    <g
      id="spingroup"
      transform="translate(16,16) translate(-29,-29)"
      style="animation: 2s linear infinite both spingroup_t"
    >
      <ellipse
        id="accent.element.1"
        rx="9"
        ry="9"
        fill="none"
        stroke="rgba(0,0,0,0.38)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-dashoffset="0"
        stroke-dasharray="0 182"
        transform="translate(29,29)"
        style="animation: 2s linear infinite both spingroup1_t, 2s linear infinite both spingroup1_da"
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
@keyframes spingroup_t {
  0% {
    transform: translate(16px, 16px) rotate(0deg) translate(-29px, -29px);
  }
  100% {
    transform: translate(16px, 16px) rotate(360deg) translate(-29px, -29px);
  }
}
@keyframes spingroup1_t {
  0% {
    transform: translate(29px, 29px) rotate(0deg);
  }
  50% {
    transform: translate(29px, 29px) rotate(0deg);
  }
  100% {
    transform: translate(29px, 29px) rotate(360deg);
  }
}
@keyframes spingroup1_da {
  0% {
    stroke-dasharray: 0px 182px;
  }
  50% {
    stroke-dasharray: 56px 56px;
  }
  100% {
    stroke-dasharray: 0px 360px;
  }
}
</style>
