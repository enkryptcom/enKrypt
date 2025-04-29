<template>
  <button class="address-item" @click="emit('selected:account', address)">
    <div class="address-item__row">
      <img :src="identicon(address)" class="address-item__identicon" />

      <div v-if="account" class="send-address-item__name">
        <h4>{{ account.name }}</h4>
        <p>
          {{ $filters.replaceWithEllipsis(address, 4, 4) }}
        </p>
      </div>
      <DoneIcon
        v-if="selected === address && account"
        class="address-item__check"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { EnkryptAccount } from '@enkryptcom/types';
import DoneIcon from '@action/icons/common/done_icon.vue';

const emit = defineEmits<{
  (e: 'selected:account', address: string): void;
}>();
const props = defineProps({
  identicon: {
    type: Function,
    default: () => '',
  },
  address: {
    type: String,
    required: true,
  },
  account: {
    type: Object as PropType<EnkryptAccount>,
    required: false,
  },
  selected: {
    type: String,
    required: false,
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.address-item {
  padding: 0;
  width: 100%;
  border-radius: 10px;
  &:hover,
  &:focus {
    background: @black007;
  }
  &__row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    padding: 8px 10px;
    gap: 12px;
    text-align: left;
  }
  &__identicon {
    flex-basis: auto;
    background: @grey16;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
    min-width: 32px;
    height: 32px;
    border-radius: 100%;
    overflow: hidden;
    object-fit: contain;
  }
  &__check {
    margin-left: auto;
  }
}
</style>
