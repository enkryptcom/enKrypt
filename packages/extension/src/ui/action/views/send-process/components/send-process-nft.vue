<template>
  <div class="send-process-nft">
    <img :src="item.image" alt="" />

    <div class="send-process-nft__info">
      <h4>{{ item.name }}</h4>
      <h6>{{ item.author }}</h6>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { NFTItem } from "@action/types/nft";

defineProps({
  item: {
    type: Object as PropType<NFTItem>,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-process-nft {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;

  img {
    width: 32px;
    border-radius: 8px;
    margin-right: 12px;
    height: 32px;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
  }

  &__info {
    h4 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 0;
      word-break: break-all;

      span {
        font-variant: small-caps;
      }
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 0;
    }

    h6 {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 0;
    }
  }
}
</style>
