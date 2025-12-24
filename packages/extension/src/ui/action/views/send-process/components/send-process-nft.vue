<template>
  <div class="send-process-nft">
    <img :src="item.image" alt="" />

    <div class="send-process-nft__info">
      <h4>{{ item.name }}</h4>
      <h6>{{ item.collectionName }}</h6>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { NFTItemWithCollectionName } from '@/types/nft';

defineProps({
  item: {
    type: Object as PropType<NFTItemWithCollectionName>,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-process-nft {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  background: linear-gradient(
    135deg,
    rgba(138, 100, 220, 0.08) 0%,
    rgba(98, 126, 234, 0.08) 100%
  );
  border-radius: 12px;
  border: 1px solid rgba(138, 100, 220, 0.12);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(138, 100, 220, 0.12) 0%,
      rgba(98, 126, 234, 0.12) 100%
    );
    transform: translateY(-1px);
  }

  img {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    margin-right: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    flex-shrink: 0;
    object-fit: cover;
  }

  &__info {
    flex: 1;
    min-width: 0;

    h4 {
      font-style: normal;
      font-weight: 600;
      font-size: 15px;
      line-height: 22px;
      color: @primaryLabel;
      margin: 0;
      word-break: break-word;
    }

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 14px;
      color: @tertiaryLabel;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    h6 {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 4px 0 0 0;
    }
  }
}
</style>
