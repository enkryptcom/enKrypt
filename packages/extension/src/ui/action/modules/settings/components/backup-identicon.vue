<template>
  <!-- The 40px svg is offset by -4px inside the 32px circle to crop
       jdenticon's built-in padding. -->
  <div
    class="relative size-8 overflow-hidden rounded-full [&>svg]:absolute [&>svg]:-top-1 [&>svg]:-left-1 [&>svg]:size-10"
    v-html="svg"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as jdenticon from 'jdenticon';

const props = defineProps<{
  hash: string;
}>();

// jdenticon builds the svg from the hash itself, so the markup is safe to inject.
const svg = computed(() => jdenticon.toSvg(props.hash, 200));
</script>
