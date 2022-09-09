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
      style="animation: 0.566s linear both back_o_ca"
    />
    <ellipse
      id="spin"
      rx="29"
      ry="29"
      stroke="#684cff"
      fill="none"
      stroke-width="6"
      stroke-linejoin="round"
      stroke-dasharray="118.02 107.987"
      stroke-linecap="round"
      stroke-dashoffset="0"
      stroke-miterlimit="4"
      opacity="1"
      transform="translate(64,64) rotate(1368.12)"
      style="animation: 0.566s linear both spin_t_ca, 0.566s linear both spin_o_ca, 0.566s linear both spin_da_ca, 0.566s linear both spin_do_ca"
    />
    <path
      id="check"
      d="M13.125,42L32.375,61.25L70.875,22.75"
      stroke-width="6"
      stroke="#684cff"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-dashoffset="0"
      stroke-dasharray="0 82"
      stroke-miterlimit="4"
      opacity="0"
      transform="translate(22,22)"
      style="animation: 0.566s linear both check_o_ca, 0.566s linear both check_da_ca"
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
@keyframes back_o_ca {
  0% {
    opacity: 0.2;
  }
  5.8304% {
    opacity: 0.2;
  }
  88.3392% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
@keyframes spin_t_ca {
  0% {
    transform: translate(64px, 64px) rotate(1368.115235deg);
  }
  5.8303% {
    transform: translate(64px, 64px) rotate(1379.999988deg);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  88.3392% {
    transform: translate(64px, 64px) rotate(1620deg);
  }
  100% {
    transform: translate(64px, 64px) rotate(1620deg);
  }
}
@keyframes spin_o_ca {
  0% {
    opacity: 1;
  }
  5.8304% {
    opacity: 1;
  }
  82.5088% {
    opacity: 1;
  }
  88.3392% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
@keyframes spin_da_ca {
  0% {
    stroke-dasharray: 118.02px 107.987px;
  }
  5.8304% {
    stroke-dasharray: 120px 106.667px;
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  88.3392% {
    stroke-dasharray: 0px 182px;
  }
  100% {
    stroke-dasharray: 0px 182px;
  }
}
@keyframes spin_do_ca {
  0% {
    stroke-dashoffset: 0px;
  }
  5.8304% {
    stroke-dashoffset: 0px;
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  88.3392% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}
@keyframes check_o_ca {
  0% {
    opacity: 0;
  }
  5.8304% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}
@keyframes check_da_ca {
  0% {
    stroke-dasharray: 0px 82px;
  }
  5.8304% {
    stroke-dasharray: 0px 82px;
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  88.3392% {
    stroke-dasharray: 82px 82px;
  }
  100% {
    stroke-dasharray: 82px 82px;
  }
}
</style>
