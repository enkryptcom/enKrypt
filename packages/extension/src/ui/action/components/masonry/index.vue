<script setup lang="ts">
import type { Ref } from "vue";
import { nextTick, onMounted, ref, toRefs, watch } from "vue";
type Column = number[];
const props = withDefaults(
  defineProps<{
    columnWidth?: number;
    items: unknown[] | undefined;
    gap?: number;
    rtl?: boolean;
    ssrColumns?: number;
  }>(),
  {
    columnWidth: 400,
    gap: 0,
    rtl: false,
    ssrColumns: 0,
  }
);
const emit = defineEmits<{
  (event: "redraw"): void;
  (event: "redrawSkip"): void;
}>();
const { columnWidth, items, gap, rtl, ssrColumns } = toRefs(props);
const columns = ref<Column[]>([]);
const masonry = ref<HTMLDivElement>() as Ref<HTMLDivElement>;
function columnCount(): number {
  const count = Math.floor(
    (masonry.value.getBoundingClientRect().width + gap.value) /
      (columnWidth.value + gap.value)
  );
  return count > 0 ? Math.max(2, count) : 2;
}
function createColumns(count: number): Column[] {
  return [...new Array(count)].map(() => []);
}
if (ssrColumns.value > 0) {
  const newColumns = createColumns(ssrColumns.value);
  if (items.value) {
    items.value.forEach((_: unknown, i: number) =>
      newColumns[i % ssrColumns.value].push(i)
    );
  }

  columns.value = newColumns;
}
async function fillColumns(itemIndex: number) {
  if (!!items.value && itemIndex >= items.value.length) {
    return;
  }
  await nextTick();
  const columnDivs = [...masonry.value.children] as HTMLDivElement[];
  if (rtl.value) {
    columnDivs.reverse();
  }
  const target = columnDivs.reduce((prev, curr) =>
    curr.getBoundingClientRect().height < prev.getBoundingClientRect().height
      ? curr
      : prev
  );
  columns.value[+target.dataset.index!].push(itemIndex);
  await fillColumns(itemIndex + 1);
}
async function redraw(force = false) {
  if (columns.value.length === columnCount() && !force) {
    emit("redrawSkip");
    return;
  }
  columns.value = createColumns(columnCount());
  const scrollY = window.scrollY;
  await fillColumns(0);
  window.scrollTo({ top: scrollY });
  emit("redraw");
}
onMounted(() => {
  redraw();
});
watch([items, rtl], () => redraw(true));
watch([columnWidth, gap], () => redraw());
</script>

<template>
  <div
    ref="masonry"
    class="masonry"
    :style="{ display: 'flex', gap: `${gap}px` }"
  >
    <div
      v-for="(column, columnIndex) in columns"
      :key="columnIndex"
      class="masonry__column"
      :data-index="columnIndex"
      :style="{
        display: 'flex',
        'flex-basis': '0px',
        'flex-direction': 'column',
        'flex-grow': 1,
        height: ['-webkit-max-content', '-moz-max-content', 'max-content'] as any,
        gap: `${gap}px`,
      }"
    >
      <div v-for="itemIndex in column" :key="itemIndex" class="masonry__item">
        <slot v-if="!!items" :item="items[itemIndex]" :index="itemIndex">
          {{ items[itemIndex] }}
        </slot>
      </div>
    </div>
  </div>
</template>
