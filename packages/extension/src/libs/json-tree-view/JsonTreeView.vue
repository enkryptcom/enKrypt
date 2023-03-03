<template>
  <JsonTreeViewItem
    :class="[{ 'root-item': true, dark: colorScheme === 'dark' }]"
    :data="parsed"
    :max-depth="maxDepth"
    @selected="itemSelected"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import JsonTreeViewItem from "./JsonTreeViewItem.vue";
import { ItemType, type ValueTypes, type ItemData } from "./types";

const props = defineProps({
  data: {
    type: String,
    required: false,
    default: "{}",
  },
  rootKey: {
    type: String,
    required: false,
    default: "/",
  },
  maxDepth: {
    type: Number,
    required: false,
    default: 1,
  },
  colorScheme: {
    type: String,
    required: false,
    default: "light",
    validator: (value: string) => ["light", "dark"].indexOf(value) !== -1,
  },
});

const emit = defineEmits<{
  (e: "selected", data: unknown): void;
}>();

function itemSelected(data: unknown): void {
  emit("selected", data);
}

function build(
  key: string,
  value: ValueTypes,
  depth: number,
  path: string,
  includeKey: boolean
): ItemData {
  if (value instanceof Object) {
    if (value instanceof Array) {
      const children = value.map((element, index) =>
        build(
          index.toString(),
          element,
          depth + 1,
          includeKey ? `${path}${key}[${index}].` : `${path}`,
          false
        )
      );
      return {
        key,
        type: ItemType.ARRAY,
        depth,
        path,
        length: children.length,
        children,
      };
    }

    const children = Object.entries(value).map(([childKey, childValue]) =>
      build(
        childKey,
        childValue,
        depth + 1,
        includeKey ? `${path}${key}.` : `${path}`,
        true
      )
    );
    return {
      key,
      type: ItemType.OBJECT,
      depth,
      path,
      length: children.length,
      children: children,
    };
  } else {
    return {
      key,
      type: ItemType.VALUE,
      path: includeKey ? `${path}${key}` : path.slice(0, -1),
      depth,
      value,
    };
  }
}

const parsed = computed((): ItemData => {
  const json = props.data;
  if (json != null && json != undefined) {
    const data = JSON.parse(json);
    if (data instanceof Object) {
      return build(props.rootKey, { ...data }, 0, "", true);
    }
  }
  return {
    key: props.rootKey,
    type: ItemType.VALUE,
    path: "",
    depth: 0,
    value: props.data,
  };
});
</script>

<style lang="less" scoped>
.root-item {
  --jtv-key-color: #0977e6;
  --jtv-valueKey-color: #073642;
  --jtv-string-color: #268bd2;
  --jtv-number-color: #2aa198;
  --jtv-boolean-color: #cb4b16;
  --jtv-null-color: #6c71c4;
  --jtv-arrow-size: 6px;
  --jtv-arrow-color: #444;
  --jtv-hover-color: rgba(0, 0, 0, 0.1);
  margin-left: 0;
  width: 100%;
  height: auto;
}
.root-item.dark {
  --jtv-key-color: #80d8ff;
  --jtv-valueKey-color: #fdf6e3;
  --jtv-hover-color: rgba(255, 255, 255, 0.1);
  --jtv-arrow-color: #fdf6e3;
}
</style>
