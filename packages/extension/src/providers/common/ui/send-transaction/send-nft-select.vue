<template>
  <div class="send-nft-select__wrap">
    <a class="send-nft-select" @click="$emit('toggleSelect', item.id !== '')">
      <div class="send-nft-select__image">
        <img :src="item.image" alt="" @error="imageLoadError" />
      </div>
      <div class="send-nft-select__info">
        <h5>
          {{ $filters.truncate(item.name, 25) }}
        </h5>
        <p>
          {{ $filters.truncate(item.collectionName, 50) }}
        </p>
      </div>

      <div class="send-nft-select__arrow">
        <switch-arrow />
      </div>
    </a>
    <div>
      <img
        v-if="item.image !== ''"
        class="send-nft-select__view"
        :src="item.image"
        alt=""
      />
      <p v-if="isSendingDisabled" class="send-nft-select__text">
        This NFT is not transferable!
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import { NFTItemWithCollectionName } from '@/types/nft';
import { imageLoadError } from '@/ui/action/utils/misc';

defineEmits<{
  (e: 'toggleSelect', val: boolean): void;
}>();

defineProps({
  item: {
    type: Object as PropType<NFTItemWithCollectionName>,
    default: () => {
      return {};
    },
  },
  isSendingDisabled: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-nft-select {
  height: 60px;
  background: @white;
  margin: 0 24px 0 24px;
  box-sizing: border-box;
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  width: calc(~'100% - 48px');
  padding: 12px 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  transition: all 200ms ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: rgba(138, 100, 220, 0.3);
    background: rgba(138, 100, 220, 0.02);
    box-shadow: 0 2px 8px rgba(138, 100, 220, 0.08);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &__wrap {
    margin-bottom: 8px;
  }

  &__image {
    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    border-radius: 10px;
    width: 36px;
    height: 36px;
    min-width: 36px;
    overflow: hidden;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;

    h5 {
      font-style: normal;
      font-weight: 600;
      font-size: 15px;
      line-height: 20px;
      color: @primaryLabel;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.2px;
      color: @secondaryLabel;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 6px;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 8px;
    transition: all 200ms ease-in-out;
    background: rgba(0, 0, 0, 0.04);

    svg {
      opacity: 0.6;
      transition: opacity 150ms ease-in-out;
    }
  }

  &:hover &__arrow {
    background: rgba(138, 100, 220, 0.1);

    svg {
      opacity: 1;
    }
  }

  &__view {
    width: 88px;
    max-height: 88px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border-radius: 14px;
    display: block;
    margin: 12px 0 12px 40px;
    float: left;
    object-fit: cover;
  }

  &__text {
    float: right;
    max-width: 200px;
    margin-right: 40px;
    margin-top: 36px;
    padding: 10px 14px;
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.08) 0%,
      rgba(220, 38, 38, 0.05) 100%
    );
    border: 1px solid rgba(239, 68, 68, 0.15);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    color: @error;
  }
}
</style>
