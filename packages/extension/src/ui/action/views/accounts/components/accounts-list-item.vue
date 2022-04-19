<template>
  <a
    class="accounts-item"
    :class="{ disabled: !active }"
    @click="select(address)"
  >
    <img :src="identiconElement(address)" />
    <div class="accounts-item__info">
      <p class="accounts-item__info-name">{{ name }}</p>
      <p class="accounts-item__info-amount">
        {{ amount }} {{ symbol }}
        <span>{{ $filters.replaceWithEllipsis(address, 6, 4) }}</span>
      </p>
    </div>
    <done-icon v-show="isChecked"></done-icon>
  </a>
</template>

<script lang="ts">
export default {
  name: "AccountsListItem",
};
</script>

<script setup lang="ts">
import DoneIcon from "@action/icons/common/done_icon.vue";
import { PropType } from "vue";

defineProps({
  name: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  amount: {
    type: String,
    default: "",
  },
  symbol: {
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
  identiconElement: {
    type: Function as PropType<(address: string, options: any) => string>,
    default: () => ({}),
  },
  active: Boolean,
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.accounts-item {
  width: 100%;
  height: 56px;
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  flex-direction: row;
  box-sizing: border-box;
  padding: 0 12px 0 12px;
  cursor: pointer;

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
    font-variant: small-caps;

    &-name {
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0;
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

  svg {
    position: absolute;
    top: 16px;
    right: 12px;
  }
}
</style>
