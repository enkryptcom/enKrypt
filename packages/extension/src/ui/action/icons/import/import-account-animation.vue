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
    <path
      id="line"
      d="M31.103,36.909C31.9213,36.7798,32.4799,36.0117,32.3507,35.1935C32.2215,34.3752,31.4534,33.8166,30.6351,33.9458L31.103,36.909ZM2.23395,33.9458C1.41566,33.8165,0.647561,34.3752,0.518356,35.1934C0.389152,36.0117,0.947766,36.7798,1.76606,36.909L2.23395,33.9458ZM3.39788,34.1295L2.23395,33.9458L1.76606,36.909L2.92999,37.0928L3.39788,34.1295ZM30.6351,33.9458L29.4711,34.1295L29.939,37.0928L31.103,36.909L30.6351,33.9458ZM2.92999,37.0928C11.8776,38.5056,20.9914,38.5056,29.939,37.0928L29.4711,34.1295C20.8336,35.4934,12.0355,35.4934,3.39788,34.1295L2.92999,37.0928Z"
      fill="#5f6368"
      transform="translate(36,50.7137) translate(-16.4345,-36.0398)"
      style="animation: 4s linear infinite both line_t"
    />
    <path
      id="arrow"
      d="M16.4347,0.499852C17.2632,0.499852,17.9347,1.17142,17.9347,1.99985L17.9347,24.9686L25.2502,17.6532C25.836,17.0674,26.7857,17.0674,27.3715,17.6532C27.9573,18.239,27.9573,19.1887,27.3715,19.7745L17.4952,29.6507C17.2139,29.9321,16.8324,30.0901,16.4346,30.0901C16.0367,30.0901,15.6552,29.9321,15.3739,29.6507L16.4346,28.5901L16.4345,28.59L15.3739,29.6507L5.49767,19.7745C4.91188,19.1887,4.91188,18.2389,5.49767,17.6532C6.08345,17.0674,7.0332,17.0674,7.61899,17.6532L14.9347,24.9689L14.9347,1.99985C14.9347,1.17143,15.6063,0.499853,16.4347,0.499852Z"
      fill="#5f6368"
      fill-rule="evenodd"
      transform="translate(36.0002,28.8389) translate(-16.4347,-14.165)"
      style="animation: 4s linear infinite both arrow_t"
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
@keyframes a0_t {
  0% {
    transform: translate(36px, 36px) rotate(0deg);
  }
  100% {
    transform: translate(36px, 36px) rotate(360deg);
  }
}
@keyframes line_t {
  0% {
    transform: translate(19.5655px, 14.6739px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  50% {
    transform: translate(19.5655px, 15.6739px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  100% {
    transform: translate(19.5655px, 14.6739px);
  }
}
@keyframes arrow_t {
  0% {
    transform: translate(19.5655px, 14.6739px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  50% {
    transform: translate(19.5654px, 13.6739px);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  100% {
    transform: translate(19.5655px, 14.6739px);
  }
}
</style>
