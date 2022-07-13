<template>
  <label class="base-file-picker">
    <input type="file" @change="previewFiles" />
    <span>{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { ref } from "vue";

const label = ref("Select file...");

const emit = defineEmits<{
  (e: "update:selectFile", files: File): void;
}>();

const previewFiles = (e: any) => {
  const files = e.target.files as FileList;

  if (files[0]) {
    label.value = files[0].name;
    emit("update:selectFile", files[0]);
  } else {
    label.value = "Select file...";
  }
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.base-file-picker {
  background-color: @primary;
  box-shadow: 0px 0.25px 1px rgba(0, 0, 0, 0.039),
    0px 0.85px 3px rgba(0, 0, 0, 0.19);
  border-radius: 10px;
  display: inline-block;
  width: 100%;
  height: 40px;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 40px;
  letter-spacing: 0.5px;
  color: @white;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  input {
    position: absolute;
    left: -9999px;
    opacity: 0;
  }

  span {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
    left: 0;
    top: 0;
  }

  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 1;
    opacity: 0;
    background: linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0.08)
      ),
      @primary;
    transition: opacity 300ms ease-in-out;
  }

  &:hover {
    &::after {
      opacity: 1;
    }
  }
}
</style>
