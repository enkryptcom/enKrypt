<template>
  <div class="accounts-item__edit">
    <a class="accounts-item__edit-item" @click.stop="renameAction">
      <edit-icon /><span>Rename</span>
    </a>
    <a class="accounts-item__edit-item" @click.stop="deleteAction">
      <delete-icon /><span class="delete">Delete</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import EditIcon from "@action/icons/actions/edit.vue";
import DeleteIcon from "@action/icons/actions/delete.vue";
import { PropType } from "vue";

defineProps({
  renameAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  deleteAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.accounts-item {
  &__edit {
    width: 220px;
    height: 104px;
    background: @white;
    box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    position: absolute;
    top: 42px;
    right: 0;
    z-index: 4;
    padding: 4px;
    box-sizing: border-box;

    &-item {
      width: 100%;
      height: 48px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      cursor: pointer;
      border-radius: 8px;
      transition: background 300ms ease-in-out;

      &:hover,
      &.active {
        background: rgba(0, 0, 0, 0.04);
      }

      svg {
        margin-right: 12px;
        margin-left: 12px;
        position: static !important;
      }

      span {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;

        &.delete {
          color: @error;
        }
      }
    }
  }
}
</style>
