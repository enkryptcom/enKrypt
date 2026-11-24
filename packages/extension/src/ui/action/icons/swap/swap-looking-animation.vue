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
          fill="#005ae5"
          stroke="none"
          transform="translate(20,9) rotate(90) translate(-29,-22)"
          style="animation: 4s linear infinite both a0_tl"
        />
        <ellipse
          rx="19"
          ry="19"
          fill="#48adff"
          stroke="none"
          transform="translate(19.3859,8.99986) translate(19,-12)"
          style="animation: 4s linear infinite both a1_tl"
        />
        <ellipse
          rx="31"
          ry="31"
          fill="#48adff"
          stroke="none"
          transform="translate(19.0035,9.00152) rotate(90) translate(31,-24)"
          style="animation: 4s linear infinite both a2_tl"
        />
        <ellipse
          rx="22"
          ry="22"
          fill="#005ae5"
          stroke="none"
          transform="translate(20,9) translate(-22,-15)"
          style="animation: 4s linear infinite both a3_tl"
        />
      </g>
      <image
        id="logo-2"
        :href="logoIcon"
        width="130"
        height="130"
        x="11"
        y="11"
        opacity="0.3"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import logoIcon from '@/assets/images/logo-icon.svg';
</script>

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
