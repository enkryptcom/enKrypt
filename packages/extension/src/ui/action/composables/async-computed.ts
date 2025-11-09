import { ref, watchEffect } from 'vue';

export default (asyncFn: () => any, initialValue: any) => {
  const value = ref(initialValue);
  const isPending = ref(false);
  const error = ref(null);

  watchEffect(async onInvalidate => {
    isPending.value = true;
    error.value = null;
    let cancelled = false;

    onInvalidate(() => {
      cancelled = true;
    });

    try {
      const result = await asyncFn();
      if (!cancelled) value.value = result;
    } catch (err) {
      if (!cancelled) error.value = err as unknown as any;
    } finally {
      if (!cancelled) isPending.value = false;
    }
  });

  return { value, isPending, error };
}
