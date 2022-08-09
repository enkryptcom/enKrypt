<template>
  <div class="send-nft-select__wrap">
    <a class="send-nft-select" @click="open">
      <div class="send-nft-select__image">
        <img :src="item.image" alt="" />
      </div>
      <div class="send-nft-select__info">
        <h5>{{ item.name }}</h5>
        <p>
          {{ item.author }}
        </p>
      </div>

      <div class="send-nft-select__arrow">
        <switch-arrow />
      </div>
    </a>

    <img class="send-nft-select__view" :src="item.image" alt="" />
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from "vue";
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import { NFTItem } from "@action/types/nft";

const isOpen = ref(false);

const props = defineProps({
  toggleSelect: {
    type: Function,
    default: () => {
      return null;
    },
  },
  item: {
    type: Object as PropType<NFTItem>,
    default: () => {
      return {};
    },
  },
});

const open = () => {
  isOpen.value = !isOpen.value;
  props.toggleSelect(isOpen);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-nft-select {
  height: 64px;
  background: #ffffff;
  margin: 0 32px 0 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;

  &__wrap {
    margin-bottom: 8px;
  }

  &__image {
    background: @buttonBg;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
    border-radius: 8px;
    width: 32px;
    height: 32px;
    overflow: hidden;
    margin-right: 12px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  &__info {
    h5 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      width: 290px;
      margin: 0 0 1px 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @secondaryLabel;
      margin: 0;
      width: 290px;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 4px;
    right: 8px;
    top: 16px;
  }

  &__view {
    width: 128px;
    filter: drop-shadow(0px 0.25px 1px rgba(0, 0, 0, 0.039))
      drop-shadow(0px 0.85px 3px rgba(0, 0, 0, 0.19));
    border-radius: 12px;
    display: block;
    margin: 16px 0 16px 48px;
  }
}
</style>
