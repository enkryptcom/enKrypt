<template>
  <a class="nft-select-list__token" @click="select">
    <div class="nft-select-list__token-info">
      <img :src="item.image" />

      <div class="nft-select-list__token-info-name">
        <h4>{{ item.name }}</h4>
        <p>
          {{ item.author }}
        </p>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { NFTItem } from "@action/types/nft";

const props = defineProps({
  item: {
    type: Object as PropType<NFTItem>,
    default: () => ({}),
  },
  selectItem: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const select = () => {
  props.selectItem(props.item);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.nft-select-list {
  &__token {
    height: 64px;
    padding: 0 16px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    cursor: pointer;

    &-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;

      img {
        width: 32px;
        height: 32px;
        margin-right: 16px;
        box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
        border-radius: 8px;
      }

      &-name {
        h4 {
          font-style: normal;
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
          color: @primaryLabel;
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
          display: flex;
          justify-content: flex-start;
          align-items: center;
          flex-direction: row;

          span {
            font-variant: small-caps;
            margin-left: 4px;
          }
        }
      }
    }

    &-price {
      text-align: right;

      h4 {
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        text-align: right;
        color: @primaryLabel;
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
      }
    }
  }
}
</style>
