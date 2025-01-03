<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ active: isActive }"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M20.1876 4.00007C20.7399 4.41429 20.8518 5.19779 20.4376 5.75007L9.93757 19.7501C9.70151 20.0648 9.33102 20.2501 8.93757 20.2501C8.54413 20.2501 8.17364 20.0648 7.93757 19.7501L2.68757 12.7501C2.27336 12.1978 2.38529 11.4143 2.93757 11.0001C3.48986 10.5859 4.27336 10.6978 4.68757 11.2501L8.93757 16.9167L18.4376 4.25007C18.8518 3.69779 19.6353 3.58586 20.1876 4.00007Z"
      fill="#684CFF"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
});
</script>
<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
  opacity: 0;
  transition: opacity 0.3s ease-in;
}
.active {
  opacity: 1;
}
</style>
