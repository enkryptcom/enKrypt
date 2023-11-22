<template>
  <div class="chain-item" @click="select(name)">
    <div class="">
      <p class="">
        {{ name }}
      </p>

      <done-icon v-show="isChecked" class="accounts-item__checked"></done-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import DoneIcon from "@action/icons/common/done_icon.vue";
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";

const openEdit = ref(false);
const dropdown = ref(null);
const toggle = ref(null);

defineProps({
  name: {
    type: String,
    default: "",
  },
  isChecked: Boolean,
  select: {
    type: Function,
    default: () => {
      return {};
    },
  },
});

onClickOutside(
  dropdown,
  () => {
    if (openEdit.value) openEdit.value = false;
  },
  { ignore: [toggle] }
);
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.chain-item {
  width: 50px;
  height: 56px;
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  flex-direction: row;
  box-sizing: border-box;
  padding: 0 8px 0 8px;
  background-color: white;
  cursor: pointer;
  transition: background 300ms ease-in-out;

  &:hover {
    background: gray;

    .accounts-item__more {
      display: block;
    }

    .accounts-item__checked {
      display: none !important;

      &.visible {
        display: block !important;
      }
    }
  }
}
</style>
