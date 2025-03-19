<template>
  <tooltip :text="tooltipText" teleport-to-app is-bottom-right>
    <svg
      v-if="isExpanded"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M6.13716 20.8303C6.93876 20.9234 7.88054 20.9655 8.99988 20.9844V3.01019C7.6075 3.02594 6.58535 3.06593 5.78175 3.16733C4.58778 3.31798 4.1873 3.57003 3.87865 3.87868C3.64265 4.11468 3.33996 4.67106 3.16962 6.13722C3.003 7.57138 2.99988 9.4543 2.99988 12C2.99988 14.5457 3.003 16.4286 3.16962 17.8628C3.33996 19.3289 3.64265 19.8853 3.87865 20.1213C4.11463 20.3573 4.67099 20.66 6.13716 20.8303ZM12 21C11.6546 21 11.3214 20.9999 10.9999 20.9994V3.00038C11.3183 3.00005 11.6514 3 12 3C15.0624 3 16.9238 3.004 18.2182 3.16733C19.4122 3.31798 19.8126 3.57003 20.1213 3.87868C20.3573 4.11464 20.6599 4.67097 20.8302 6.13716C20.9968 7.57135 20.9999 9.45426 20.9999 12C20.9999 14.5457 20.9968 16.4287 20.8302 17.8628C20.6599 19.329 20.3573 19.8854 20.1213 20.1213C19.8853 20.3573 19.329 20.66 17.8628 20.8303C16.4286 20.9969 14.5457 21 12 21ZM2.46444 2.46447C0.999973 3.92893 0.999878 7 0.999878 12C0.999878 17 0.999972 20.0711 2.46444 21.5355C3.9289 23 6.99997 23 12 23C17 23 20.071 23 21.5355 21.5355C22.9999 20.0712 22.9999 17.0004 22.9999 12.001V12V11.999C22.9999 6.9996 22.9999 3.92884 21.5355 2.46447C20.071 1 18 1 12 1C5.99997 1 3.9289 1 2.46444 2.46447ZM7.70698 10.7071C8.09751 10.3166 8.09751 9.68342 7.70698 9.29289C7.31646 8.90237 6.6833 8.90237 6.29277 9.29289L4.29277 11.2929C3.90225 11.6834 3.90225 12.3166 4.29277 12.7071L6.29277 14.7071C6.6833 15.0976 7.31646 15.0976 7.70698 14.7071C8.09751 14.3166 8.09751 13.6834 7.70698 13.2929L6.41409 12L7.70698 10.7071Z"
        fill="black"
        fill-opacity="0.9"
      />
    </svg>
    <div v-else class="logo" ref="target">
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        v-show="!isHovered"
      >
        <g clip-path="url(#clip0_7430_6683)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 3.46372C0 1.55063 1.55079 0 3.46372 0H17.9998V2.65771C17.9998 4.03269 16.8853 5.14724 15.5103 5.14724H8.67603C6.76294 5.14724 5.21231 6.69803 5.21231 8.61112V9.49244C5.21231 11.4055 6.76294 12.9562 8.67603 12.9562H15.5103C16.8853 12.9562 17.9998 14.0709 17.9998 15.4459V18H3.46372C1.55079 18 0 16.4491 0 14.5361V3.46372ZM8.82701 6.59568H15.8365C17.0321 6.59568 18.0013 7.56498 18.0013 8.76049V9.34274C18.0013 10.5384 17.0321 11.5077 15.8365 11.5077H8.82701C7.63134 11.5077 6.66204 10.5384 6.66204 9.34274V8.76049C6.66204 7.56498 7.63134 6.59568 8.82701 6.59568Z"
            fill="url(#paint0_radial_7430_6683)"
          />
        </g>
        <defs>
          <radialGradient
            id="paint0_radial_7430_6683"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(0.499683 -0.499682) rotate(55.3758) scale(25.5035 101.911)"
          >
            <stop offset="0.051483" stop-color="#C549FF" />
            <stop offset="0.815643" stop-color="#704BFF" />
          </radialGradient>
          <clipPath id="clip0_7430_6683">
            <rect width="18" height="18" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <svg
        v-show="!isHovered"
        class="caret"
        width="4"
        height="6"
        viewBox="0 0 4 6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 5L3 3L1 1"
          stroke="black"
          stroke-opacity="0.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <svg
        v-show="isHovered"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M6.13716 20.8303C6.93876 20.9234 7.88054 20.9655 8.99988 20.9844V3.01019C7.6075 3.02594 6.58535 3.06593 5.78175 3.16733C4.58778 3.31798 4.1873 3.57003 3.87865 3.87868C3.64265 4.11468 3.33996 4.67106 3.16962 6.13722C3.003 7.57138 2.99988 9.4543 2.99988 12C2.99988 14.5457 3.003 16.4286 3.16962 17.8628C3.33996 19.3289 3.64265 19.8853 3.87865 20.1213C4.11463 20.3573 4.67099 20.66 6.13716 20.8303ZM12 21C11.6546 21 11.3214 20.9999 10.9999 20.9994V3.00038C11.3183 3.00005 11.6514 3 12 3C15.0624 3 16.9238 3.004 18.2182 3.16733C19.4122 3.31798 19.8126 3.57003 20.1213 3.87868C20.3573 4.11464 20.6599 4.67097 20.8302 6.13716C20.9968 7.57135 20.9999 9.45426 20.9999 12C20.9999 14.5457 20.9968 16.4287 20.8302 17.8628C20.6599 19.329 20.3573 19.8854 20.1213 20.1213C19.8853 20.3573 19.329 20.66 17.8628 20.8303C16.4286 20.9969 14.5457 21 12 21ZM2.46444 2.46447C0.999973 3.92893 0.999878 7 0.999878 12C0.999878 17 0.999972 20.0711 2.46444 21.5355C3.9289 23 6.99997 23 12 23C17 23 20.071 23 21.5355 21.5355C22.9999 20.0712 22.9999 17.0004 22.9999 12.001V12V11.999C22.9999 6.9996 22.9999 3.92884 21.5355 2.46447C20.071 1 18 1 12 1C5.99997 1 3.9289 1 2.46444 2.46447ZM4.29277 13.2929C3.90225 13.6834 3.90225 14.3166 4.29277 14.7071C4.6833 15.0976 5.31646 15.0976 5.70698 14.7071L7.70698 12.7071C8.09751 12.3166 8.09751 11.6834 7.70698 11.2929L5.70698 9.29289C5.31646 8.90237 4.6833 8.90237 4.29277 9.29289C3.90225 9.68342 3.90225 10.3166 4.29277 10.7071L5.58566 12L4.29277 13.2929Z"
          fill="black"
          fill-opacity="0.9"
        />
      </svg>
    </div>
  </tooltip>
</template>
<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { ref, computed } from 'vue';
import Tooltip from '@/ui/action/components/tooltip/index.vue';

const props = defineProps({
  isExpanded: {
    type: Boolean,
    default: true,
  },
});

const target = ref<HTMLElement | null>(null);
const isHovered = useElementHover(target);

const tooltipText = computed(() => {
  return props.isExpanded ? 'Collapse' : 'Expand';
});
</script>
<style scoped lang="less">
@import '@action/styles/theme.less';

.logo {
  position: relative;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 11px;
  padding-right: 11px;
  text-decoration: none;
  cursor: pointer;
  font-size: 0;
  border-radius: 10px;
  transition: background 300ms ease-in-out;
  margin-left: -4px;

  &:hover {
    background: @black007;
    padding-left: 8px;
    padding-right: 8px;
    margin-left: -4px;
  }
}
.caret {
  position: absolute;
  right: 2px;
  top: 15px;
}
svg {
  display: inline-block;
  vertical-align: baseline;
}
</style>
