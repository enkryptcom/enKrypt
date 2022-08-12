<template>
  <div class="hardware-select-patch__wrap">
    <a class="hardware-select-patch" @click="toggleSelectPath">
      <div class="hardware-select-patch__title">Derivation path</div>

      <div class="hardware-select-patch__arrow">
        <div class="hardware-select-patch__value">
          <span>{{ selectedPath.label }}</span>
        </div>
        <switch-arrow />
      </div>
    </a>
    <div v-show="isSelectPath" class="hardware-select-patch__list">
      <a
        v-for="(curPath, index) in paths"
        :key="index"
        class="hardware-select-patch__list-item"
        @click="selectPath(curPath)"
      >
        <h6>{{ curPath.label }}</h6>
        <p>{{ curPath.path }}</p>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import { PropType, ref } from "vue";
import { PathType } from "../types";

const emit = defineEmits<{
  (e: "update:selectedPath", path: PathType): void;
}>();

const isSelectPath = ref(false);
defineProps({
  paths: {
    type: Array as PropType<PathType[]>,
    default: () => [],
  },
  selectedPath: {
    type: Object as PropType<PathType>,
    default: () => ({}),
  },
});

const toggleSelectPath = () => {
  isSelectPath.value = !isSelectPath.value;
};

const selectPath = (path: PathType) => {
  toggleSelectPath();
  emit("update:selectedPath", path);
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.hardware-select-patch {
  height: 40px;
  background: #ffffff;
  margin: 0 0 16px 0;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  padding: 10px 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  width: 100%;

  &__wrap {
    position: relative;
  }

  &__title {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    right: 12px;
    top: 8px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
  }

  &__value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    margin-right: 4px;

    span {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: @primaryLabel;
    }

    svg {
      margin-right: 4px;
    }
  }

  &__list {
    position: absolute;
    width: 220px;
    height: auto;
    right: 0;
    top: 36px;
    background: @white;
    box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    padding: 8px;
    box-sizing: border-box;
    z-index: 11;

    &-item {
      transition: background 300ms ease-in-out;
      cursor: pointer;
      padding: 6px 16px;
      display: block;
      box-sizing: border-box;
      border-radius: 10px;

      h6 {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        margin: 0;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: @secondaryLabel;
        margin: 0;
      }

      &:hover {
        background: @black004;
      }
    }
  }
}
</style>
