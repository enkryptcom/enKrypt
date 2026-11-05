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
      transform="translate(36,36)"
      style="animation: 4s linear infinite both a0_t"
    />
    <g
      id="ledger"
      fill="none"
      transform="translate(34,37) translate(-16.5,-19.5)"
      style="animation: 4s linear infinite both ledger_t"
    >
      <path
        id="screen"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.819015,11.8365C1.13988,12,1.55992,12,2.4,12L21.75,12L21.75,6C21.75,3.10051,24.1005,0.75,27,0.75C29.8995,0.75,32.25,3.10051,32.25,6L32.25,8.907C32.7279,8.04582,33,7.05469,33,6C33,2.68629,30.3137,0,27,0L2.4,0C1.55992,0,1.13988,0,0.819014,0.163491C0.536771,0.307301,0.3073,0.536772,0.16349,0.819015C0,1.13988,0,1.55992,0,2.4L0,9.6C0,10.4401,0,10.8601,0.163491,11.181C0.307301,11.4632,0.536772,11.6927,0.819015,11.8365Z"
        fill="#5F6368"
        transform="translate(27,9) rotate(-4) translate(-27,-6)"
        style="animation: 4s linear infinite both screen_t"
      />
      <path
        id="case"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.5,6L10.5,31.4286L10.4999,31.4969L10.4999,31.4999L10.4969,31.4999L10.4286,31.5L1.57143,31.5L1.50311,31.4999L1.50011,31.4999L1.5001,31.4969L1.5,31.4286L1.5,6C1.5,3.51472,3.51472,1.5,6,1.5C8.48528,1.5,10.5,3.51472,10.5,6ZM0,6C0,2.68629,2.68629,0,6,0C9.31371,0,12,2.68629,12,6L12,31.4286C12,31.4949,12,31.5281,11.999,31.5561C11.9696,32.3405,11.3405,32.9696,10.5561,32.999C10.5281,33,10.4949,33,10.4286,33L1.57143,33C1.50511,33,1.47195,33,1.44391,32.999C0.65952,32.9696,0.0303989,32.3405,0.00104895,31.5561C0,31.5281,0,31.4949,0,31.4286L0,6ZM6,9C7.65685,9,9,7.65685,9,6C9,4.34315,7.65685,3,6,3C4.34315,3,3,4.34315,3,6C3,7.65685,4.34315,9,6,9ZM7.5,6C7.5,6.82843,6.82843,7.5,6,7.5C5.17157,7.5,4.5,6.82843,4.5,6C4.5,5.17157,5.17157,4.5,6,4.5C6.82843,4.5,7.5,5.17157,7.5,6Z"
        fill="#5F6368"
        transform="translate(27,9) rotate(2) translate(-6,-6)"
        style="animation: 4s linear infinite both case_t"
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
    transform: translate(36px, 36px) rotate(0deg);
  }
  100% {
    transform: translate(36px, 36px) rotate(360deg);
  }
}
@keyframes ledger_t {
  0% {
    transform: translate(17.5px, 17.5px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  50% {
    transform: translate(17.5px, 19.5px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  100% {
    transform: translate(17.5px, 17.5px);
  }
}
@keyframes screen_t {
  0% {
    transform: translate(27px, 9px) rotate(-4deg) translate(-27px, -6px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  50% {
    transform: translate(27px, 9px) rotate(5deg) translate(-27px, -6px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  100% {
    transform: translate(27px, 9px) rotate(-4deg) translate(-27px, -6px);
  }
}
@keyframes case_t {
  0% {
    transform: translate(27px, 9px) rotate(2deg) translate(-6px, -6px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  50% {
    transform: translate(27px, 9px) rotate(-2deg) translate(-6px, -6px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  100% {
    transform: translate(27px, 9px) rotate(2deg) translate(-6px, -6px);
  }
}
</style>
