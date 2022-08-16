<template>
  <label class="switch">
    <input type="checkbox" :checked="isChecked" @change="checkLocal($event)" />
    <span class="slider round" />
  </label>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "update:check", isChecked: boolean): void;
}>();
defineProps({
  isChecked: Boolean,
});

const checkLocal = (e: any) => {
  emit("update:check", e.target.checked);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: @default;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: @white;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: @success;
}

input:focus + .slider {
  box-shadow: 0 0 1px @success;
}

input:checked + .slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
