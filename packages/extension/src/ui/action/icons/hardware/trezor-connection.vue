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
      id="trezor"
      transform="translate(36,35) translate(-11.25,-18)"
      style="animation: 4s linear infinite both trezor_t"
    >
      <path
        id="hardware"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M6.75,4.79561C6.75,3.11838,6.75,2.27976,7.07698,1.63803C7.3646,1.07354,7.82354,0.614601,8.38803,0.32698C9.02976,0,9.86984,0,11.55,0L24.45,0C26.1302,0,26.9702,0,27.612,0.32698C28.1765,0.614601,28.6354,1.07354,28.923,1.63803C29.25,2.27976,29.25,3.11838,29.25,4.79561L29.25,18C29.25,25.0294,26.6764,27.9411,24.5444,30.3532C23.5793,31.4451,22.7047,32.4346,22.2002,33.6573C21.7429,34.7658,21.5142,35.32,21.3323,35.5171C21.1175,35.75,21.0468,35.7973,20.7496,35.9071C20.4981,36,20.1155,36,19.3503,36L16.6497,36C15.8845,36,15.5019,36,15.2504,35.9071C14.9532,35.7973,14.8825,35.75,14.6677,35.5171C14.4858,35.32,14.2571,34.7658,13.7998,33.6573C13.2953,32.4346,12.4207,31.4451,11.4556,30.3532C9.32359,27.9411,6.75,25.0294,6.75,18L6.75,4.79561ZM9.75,8.4C9.75,7.55992,9.75,7.13988,9.91349,6.81901C10.0573,6.53677,10.2868,6.3073,10.569,6.16349C10.8899,6,11.3099,6,12.15,6L23.85,6C24.6901,6,25.1101,6,25.431,6.16349C25.7132,6.3073,25.9427,6.53677,26.0865,6.81901C26.25,7.13988,26.25,7.55992,26.25,8.4L26.25,18.6C26.25,19.4401,26.25,19.8601,26.0865,20.181C25.9427,20.4632,25.7132,20.6927,25.431,20.8365C25.1101,21,24.6901,21,23.85,21L12.15,21C11.3099,21,10.8899,21,10.569,20.8365C10.2868,20.6927,10.0573,20.4632,9.91349,20.181C9.75,19.8601,9.75,19.4401,9.75,18.6L9.75,8.4Z"
        fill="#5F6368"
        transform="translate(11.25,18) translate(-18,-18)"
      />
      <path
        id="logo"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M21.75,11.6144L20.6529,11.6144L20.6529,10.7958C20.6529,9.3922,19.4626,8.25,18.0007,8.25C16.5379,8.25,15.3476,9.3922,15.3476,10.7958L15.3476,11.6144L14.25,11.6144L14.25,17.4448L14.2575,17.4448L18.0001,19.2016L21.7425,17.4448L21.75,17.4448L21.75,11.6144ZM20.2407,12.9824L20.2407,16.4752L18.0001,17.5246L15.7593,16.4752L15.7593,12.9824L20.2407,12.9824ZM16.7084,11.6144L16.7084,10.7958C16.7084,10.1462,17.2881,9.61755,18.0007,9.61755C18.7124,9.61755,19.2922,10.1462,19.2922,10.7958L19.2922,11.6144L16.7084,11.6144Z"
        fill="#5F6368"
        opacity="1"
        transform="translate(11.25,18) translate(-18,-18)"
        style="animation: 4s linear infinite both logo_o"
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
@keyframes trezor_t {
  0% {
    transform: translate(24.75px, 17px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  50% {
    transform: translate(24.75px, 19px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  100% {
    transform: translate(24.75px, 17px);
  }
}
@keyframes logo_o {
  0% {
    opacity: 1;
  }
  40% {
    opacity: 1;
  }
  42.5% {
    opacity: 0.5;
  }
  45% {
    opacity: 1;
  }
  47.5% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  52.5% {
    opacity: 0.5;
  }
  55% {
    opacity: 1;
  }
  57.5% {
    opacity: 0.5;
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}
</style>
