<template>
  <div class="flex w-[320px] flex-col">
    <img :src="appLogo" alt="MEW" class="mb-6 mr-auto h-10" />
    <h1 class="mb-2 text-heading-lg">Too many attempts</h1>
    <p class="mb-4 text-text-base text-text-subtle">
      You need to wait until entering password again
    </p>
    <p class="text-heading-2xl tabular-nums" role="timer" aria-live="off">
      {{ formatted }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import appLogo from '@/assets/images/logo.svg';

const props = defineProps<{
  /** Epoch ms when the lock ends. */
  until: number;
}>();

const emit = defineEmits<{ done: [] }>();

const secondsLeft = ref(0);
let interval: ReturnType<typeof setInterval> | undefined;

const tick = () => {
  secondsLeft.value = Math.max(0, Math.ceil((props.until - Date.now()) / 1000));
  if (secondsLeft.value === 0) {
    clearInterval(interval);
    emit('done');
  }
};

const formatted = computed(() => {
  const m = Math.floor(secondsLeft.value / 60);
  const s = secondsLeft.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

onMounted(() => {
  tick();
  interval = setInterval(tick, 1000);
});
onUnmounted(() => clearInterval(interval));
</script>
