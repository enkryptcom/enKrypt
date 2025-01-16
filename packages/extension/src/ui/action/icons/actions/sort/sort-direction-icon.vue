<template>
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ 'flip-vertical': isAsc }"
  >
    <circle cx="7" cy="7" r="7" fill="#D9D9D9" />
    <path
      d="M6.64645 10.3536C6.84171 10.5488 7.15829 10.5488 7.35355 10.3536L10.5355 7.17157C10.7308 6.97631 10.7308 6.65973 10.5355 6.46447C10.3403 6.2692 10.0237 6.2692 9.82843 6.46447L7 9.29289L4.17157 6.46447C3.97631 6.2692 3.65973 6.2692 3.46447 6.46447C3.2692 6.65973 3.2692 6.97631 3.46447 7.17157L6.64645 10.3536ZM6.5 3L6.5 10L7.5 10L7.5 3L6.5 3Z"
      fill="black"
    />
  </svg>
</template>
<script setup lang="ts">
defineProps({
  isAsc: {
    type: Boolean,
    default: false,
  },
});
</script>
<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
  transition: transform 0.5s ease-in-out;
}
.flip-vertical {
  transform: rotateX(180deg);
}
</style>
