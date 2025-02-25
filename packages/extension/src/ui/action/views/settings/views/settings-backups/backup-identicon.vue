<template>
  <div ref="jdenticonHolder" class="jdenticon-container"></div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, Ref } from 'vue';
import * as jdenticon from 'jdenticon';

const props = defineProps<{
  hash: string;
}>();
const element: Ref<HTMLElement | null> = useTemplateRef('jdenticonHolder');
onMounted(() => {
  element.value!.innerHTML = jdenticon.toSvg(props.hash, 200);
});
</script>

<style lang="less">
.jdenticon-container {
  border-radius: 50%;
  overflow: hidden;
  height: 32px;
  width: 32px;
  position: relative;

  svg {
    width: 40px;
    height: 40px;
    position: absolute;
    top: -4px;
    left: -4px;
  }
}
</style>
