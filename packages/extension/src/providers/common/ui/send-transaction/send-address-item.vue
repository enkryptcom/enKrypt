<template>
  <a
    class="send-address-item"
    @click="emit('selected:account', account.address)"
  >
    <div class="send-address-item__info">
      <img :src="network.identicon(network.displayAddress(account.address))" />

      <div class="send-address-item__name">
        <h4>{{ account.name }}</h4>
        <p>
          {{
            $filters.replaceWithEllipsis(
              network.displayAddress(account.address),
              6,
              4
            )
          }}
        </p>
      </div>
    </div>

    <done-icon v-show="isChecked" class="send-address-item__checked" />
  </a>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { BaseNetwork } from "@/types/base-network";
import DoneIcon from "@action/icons/common/done_icon.vue";
import { EnkryptAccount } from "@enkryptcom/types";
const emit = defineEmits<{
  (e: "selected:account", address: string): void;
}>();
defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  account: {
    type: Object as PropType<EnkryptAccount>,
    default: () => {
      return {};
    },
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 56px;
  cursor: pointer;
  text-decoration: none;
  transition: background 300ms ease-in-out;
  border-radius: 10px;

  &:hover {
    background: @black007;
  }

  &__number {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;
    width: 24px;
  }

  &__info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    height: 56px;

    img {
      width: 32px;
      height: 32px;
      margin-right: 16px;
      margin-left: 8px;
      border-radius: 100%;
    }
  }

  &__name {
    h4 {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0;
      white-space: nowrap;
      width: 270px;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0 !important;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__action {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    a {
      display: inline-block;
      font-size: 0;
      margin-right: 10px;
    }
  }

  &__checked {
    margin-right: 12px;
  }
}
</style>
