<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 152 152"
    text-rendering="geometricPrecision"
    shape-rendering="geometricPrecision"
    height="152"
    width="152"
    style="white-space: pre"
  >
    <defs>
      <filter id="Filter-0" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <filter
        id="Filter-1"
        x="-87%"
        y="-71%"
        width="361%"
        height="313%"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur stdDeviation="28" />
      </filter>
      <radialGradient
        id="Gradient-0"
        cx="0"
        cy="0"
        r="35.4999"
        fx="0"
        fy="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#c549ff" />
        <stop offset="0.905236" stop-color="#704bff" />
      </radialGradient>
      <mask id="Mask-1" style="mask-type: luminance">
        <ellipse
          rx="66"
          ry="66"
          fill="#ffffff"
          stroke="none"
          filter="url(#Filter-0)"
          transform="translate(76,76)"
        />
      </mask>
    </defs>
    <g mask="url(#Mask-1)">
      <rect
        width="152"
        height="152"
        fill="rgba(255,255,255,0.00)"
        stroke="none"
        transform="translate(17.5,10.5) translate(-17.5,-10.5)"
      />
      <g
        filter="url(#Filter-1)"
        transform="translate(70.5,74) translate(-14,-7)"
      >
        <ellipse
          rx="29"
          ry="29"
          fill="#684cff"
          stroke="none"
          transform="translate(20,9) rotate(90) translate(-29,-22)"
          style="animation: 4s linear infinite both a0_tl"
        />
        <ellipse
          rx="19"
          ry="19"
          fill="#c549ff"
          stroke="none"
          transform="translate(19.3859,8.99986) translate(19,-12)"
          style="animation: 4s linear infinite both a1_tl"
        />
        <ellipse
          rx="31"
          ry="31"
          fill="#c549ff"
          stroke="none"
          transform="translate(19.0035,9.00152) rotate(90) translate(31,-24)"
          style="animation: 4s linear infinite both a2_tl"
        />
        <ellipse
          rx="22"
          ry="22"
          fill="#684cff"
          stroke="none"
          transform="translate(20,9) translate(-22,-15)"
          style="animation: 4s linear infinite both a3_tl"
        />
      </g>
      <path
        id="logo-2"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0,6.15779C0,2.75671,2.75697,0,6.15779,0L32,0L32,4.72483C32,7.16928,30.0185,9.15072,27.574,9.15072L15.4242,9.15072C12.0231,9.15072,9.2664,11.9076,9.2664,15.3088L9.2664,16.8756C9.2664,20.2767,12.0231,23.0334,15.4242,23.0334L27.574,23.0334C30.0185,23.0334,32,25.0151,32,27.4596L32,32.0003L6.15779,32.0003C2.75697,32.0003,0,29.243,0,25.8422L0,6.15779ZM15.69,11.726L28.1513,11.726C30.277,11.726,32,13.4492,32,15.5745L32,16.6096C32,18.7353,30.277,20.4585,28.1513,20.4585L15.69,20.4585C13.5644,20.4585,11.8412,18.7353,11.8412,16.6096L11.8412,15.5745C11.8412,13.4492,13.5644,11.726,15.69,11.726Z"
        fill="url(#Gradient-0)"
        opacity="1"
        fill-opacity="1"
        stroke-opacity="1"
        transform="translate(76,76.0001) translate(-16,-16.0002)"
        style="mix-blend-mode: normal"
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
@keyframes a0_tl {
  0% {
    transform: translate(20px, 9px) rotate(90deg) translate(-29px, -22px);
  }
  100% {
    transform: translate(20px, 9px) rotate(810deg) translate(-29px, -22px);
  }
}
@keyframes a1_tl {
  0% {
    transform: translate(19.3859px, 8.99986px) rotate(0deg)
      translate(19px, -12px);
  }
  100% {
    transform: translate(19.3859px, 8.99986px) rotate(-720deg)
      translate(19px, -12px);
  }
}
@keyframes a2_tl {
  0% {
    transform: translate(19.0035px, 9.00152px) rotate(90deg)
      translate(31px, -24px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  }
  100% {
    transform: translate(19.0035px, 9.00152px) rotate(450deg)
      translate(31px, -24px);
  }
}
@keyframes a3_tl {
  0% {
    transform: translate(20px, 9px) rotate(0deg) scale(1, 1)
      translate(-22px, -15px);
  }
  72.5% {
    transform: translate(20px, 9px) rotate(-261deg) scale(1.3, 1.3)
      translate(-22px, -15px);
  }
  100% {
    transform: translate(20px, 9px) rotate(-360deg) scale(1, 1)
      translate(-22px, -15px);
  }
}
</style>
