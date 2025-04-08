<template>
  <app-dialog v-model="model" width="360px" is-centered @close:dialog="close">
    <div class="nft-detail-view__wrap">
      <a
        class="nft-detail-view__favorite"
        @click="favClicked(!localIsFavorite)"
      >
        <nft-more-add-to-favorite v-if="!localIsFavorite" />
        <nft-more-delete-from-favorite v-else />
      </a>

      <notification
        v-if="isFavoriteAction"
        :hide="toggleNotification"
        :text="
          localIsFavorite ? 'Added to favorites' : 'Removed from favorites'
        "
        class="nft-detail-view__notification"
      />
      <tooltip
        v-if="props.item.name.length > 118"
        :text="props.item.name"
        is-top-right
      >
        <h3>
          {{ nftTitle }}
        </h3>
      </tooltip>
      <h3 v-else>
        {{ nftTitle }}
      </h3>
      <img :src="item.image" alt="" @error="imageLoadError" />

      <div class="nft-detail-view__action">
        <action-menu :link="item.url" :item="item" />
      </div>
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref, computed } from 'vue';
import ActionMenu from '@action/components/action-menu/index.vue';
import NftMoreAddToFavorite from '@action/icons/nft/nft-more-add-to-favorite.vue';
import NftMoreDeleteFromFavorite from '@action/icons/nft/nft-more-delete-from-favorite.vue';
import { NFTItem } from '@/types/nft';
import Notification from '@action/components/notification/index.vue';
import { imageLoadError } from '@action/utils/misc';
import Tooltip from '@/ui/action/components/tooltip/index.vue';
import AppDialog from '@action/components/app-dialog/index.vue';

const isFavoriteAction = ref(false);
const localIsFavorite = ref(false);
const props = defineProps({
  item: {
    type: Object as PropType<NFTItem>,
    default: () => {
      return {};
    },
  },
  isFavorite: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});

onMounted(() => {
  localIsFavorite.value = props.isFavorite;
});

const emit = defineEmits<{
  (e: 'close:popup'): void;
  (e: 'update:favClicked', isFav: boolean, item: NFTItem): void;
}>();
const close = () => {
  if (localIsFavorite.value !== props.isFavorite)
    emit('update:favClicked', localIsFavorite.value, props.item);
  emit('close:popup');
};

/**
 * @description Truncate NFT title if it's too long. Since the title will prolong popup and it wont fit into the extension screen
 */
const nftTitle = computed(() => {
  if (props.item.name && props.item.name.length > 0) {
    return props.item.name.length > 118
      ? props.item.name.slice(0, 118) + '...'
      : props.item.name;
  } else {
    return 'NFT #' + props.item.id;
  }
});
const favClicked = (isFav: boolean) => {
  localIsFavorite.value = isFav;
  setTimeout(() => {
    toggleNotification();
  }, 100);
};
const toggleNotification = () => {
  isFavoriteAction.value = !isFavoriteAction.value;
};

const model = defineModel<boolean>();
</script>

<style lang="less">
@import '@action/styles/theme.less';

.nft-detail-view {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    overflow-x: hidden;
    padding: 24px 32px 32px 32px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0 0 16px 0;
      max-width: 236px;
      overflow-wrap: break-word;
    }

    img {
      width: 100%;
      max-height: 296px;
      margin: 0 0 16px 0;
      box-shadow:
        0px 0.25px 1px rgba(0, 0, 0, 0.039),
        0px 0.85px 3px rgba(0, 0, 0, 0.19);
      border-radius: 12px;
    }
  }

  &__container {
    width: 800px;
    height: 600px;
    left: 0;
    top: 0px;
    position: fixed;
    z-index: 105;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

  &__favorite {
    position: absolute;
    top: 8px;
    right: 48px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;
    padding: 8px;

    &:hover {
      background: @black007;
    }
  }

  &__action {
    margin: 0;
    width: 100%;
  }

  &__notification {
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateY(0px);
    top: 76px;
    z-index: 141;
  }
}
</style>
