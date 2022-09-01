<template>
  <div class="accounts-item__edit">
    <a class="accounts-item__edit-item" @click.stop="$emit('action:rename')">
      <edit-icon /><span>Rename</span>
    </a>
    <a
      v-if="deletable"
      class="accounts-item__edit-item"
      @click.stop="$emit('action:delete')"
    >
      <delete-icon /><span class="delete">Delete</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import EditIcon from "@action/icons/actions/edit.vue";
import DeleteIcon from "@action/icons/actions/delete.vue";
defineEmits<{
  (e: "action:rename"): void;
  (e: "action:delete"): void;
}>();
defineProps({
  deletable: Boolean,
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.accounts-item {
  &__edit {
    width: 220px;
    height: fit-content;
    background: @white;
    box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    position: absolute;
    top: 44px;
    right: 0;
    z-index: 4;
    padding: 8px;
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
