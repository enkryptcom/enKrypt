<template>
  <div
    class="accounts-item"
    :class="{ disabled: !active }"
    @click="select(address)"
  >
    <img :src="identiconElement(address)" />
    <div class="accounts-item__info">
      <p class="accounts-item__info-name">
        {{ name }}
      </p>
      <p class="accounts-item__info-amount">
        {{ $filters.formatFloatingPointValue(amount).value }} {{ symbol }}
        <span>{{ $filters.replaceWithEllipsis(address, 6, 4) }}</span>
      </p>
    </div>
    <done-icon
      v-show="isChecked"
      class="accounts-item__checked"
      :class="{ visible: !showEdit }"
    ></done-icon>
    <div
      v-if="showEdit"
      ref="toggle"
      class="accounts-item__more"
      @click.stop="toggleEdit"
    >
      <more-icon />
    </div>
    <accounts-list-item-menu
      v-if="openEdit"
      ref="dropdown"
      :deletable="deletable"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import DoneIcon from "@action/icons/common/done_icon.vue";
import MoreIcon from "@action/icons/common/more-icon.vue";
import AccountsListItemMenu from "./accounts-list-item-menu.vue";
import { PropType, ref } from "vue";
import { onClickOutside } from "@vueuse/core";

const openEdit = ref(false);
const dropdown = ref(null);
const toggle = ref(null);

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
    type: Function as PropType<(address: string, options?: any) => string>,
    default: () => ({}),
  },
  active: Boolean,
  showEdit: Boolean,
  deletable: Boolean,
});

const toggleEdit = () => {
  openEdit.value = !openEdit.value;
};

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

.accounts-item {
  width: calc(~"100% - 16px");
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

  &:hover {
    background: @black004;

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
      width: 220px;
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

  svg {
    position: absolute;
    top: 16px;
    right: 12px;
  }

  &__more {
    display: none;
    cursor: pointer;
    position: absolute;
    top: 16px;
    right: 12px;
    z-index: 2;
    font-size: 0;

    svg {
      position: static;
    }
  }
}
</style>
