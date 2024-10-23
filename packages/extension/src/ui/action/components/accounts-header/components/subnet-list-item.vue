<template>
  <div class="chains-item" @click="$emit('select:subnetwork', network.id)">
    <div class="chains-item__info">
      <p class="chains-item__info-name">{{ network.name }}</p>
    </div>
    <done-icon v-show="isChecked" class="chains-item__checked"></done-icon>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import DoneIcon from '@action/icons/common/done_icon.vue';
import { SubNetworkOptions } from '@/types/base-network';

const openEdit = ref(false);
const dropdown = ref(null);
const toggle = ref(null);

defineProps({
  network: {
    type: Object as PropType<SubNetworkOptions>,
    default: () => ({
      id: '',
      name: '',
    }),
  },
  isChecked: Boolean,
});

defineEmits<{
  (e: 'select:subnetwork', id: string): void;
}>();

onClickOutside(
  dropdown,
  () => {
    if (openEdit.value) openEdit.value = false;
  },
  { ignore: [toggle] },
);
</script>

<style lang="less">
@import '@action/styles/theme.less';

.chains-item {
  width: calc(~'100% - 16px');
  height: 56px;
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  flex-direction: row;
  box-sizing: border-box;
  padding: 0 8px 0 8px;
  cursor: pointer;
  margin-left: 8px;
  transition: background 300ms ease-in-out;
  border-radius: 10px;

  &:first-child {
    margin-top: 9px;
  }

  &__checked {
    padding-top: 5px;
  }

  &:hover {
    background: @black004;
  }

  &.disabled {
    opacity: 0.16;
    pointer-events: none;
  }

  img {
    width: 32px;
    height: 32px;
    margin-right: 12px;
    border-radius: 50%;
  }

  &__info {
    &-name {
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0;
      white-space: nowrap;
      width: auto;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    &-amount {
      display: block;
      font-style: normal;
      font-weight: normal;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      letter-spacing: 0.5px;
      margin: 0;

      span {
        color: @tertiaryLabel;
      }
    }
  }
}
</style>
