<template>
  <div class="action-menu">
    <div class="action-menu__wrap">
      <a class="action-menu__item" @click="openSend()"> <Send />Send NFT</a>
      <div v-if="link" class="action-menu__divider"></div>
      <a v-if="link" class="action-menu__item" @click="openLink()">
        <View />
        View NFT
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import Send from '@action/icons/actions/send.vue';
import View from '@/ui/action/icons/actions/view.vue';
import { useRoute, useRouter } from 'vue-router';
import { PropType } from 'vue';
import { NFTItem } from '@/types/nft';
const route = useRoute();
const router = useRouter();
const props = defineProps({
  link: {
    type: String,
    default: '',
  },
  item: {
    type: Object as PropType<NFTItem>,
    default: () => {
      return {};
    },
  },
});
const openLink = () => {
  if (props.link && props.link !== null) {
    window.open(props.link, '_blank');
  }
};
const openSend = () => {
  router.push({
    name: 'send-transaction',
    params: {
      id: route.params.id,
      isToken: 'false',
      tokenData: JSON.stringify(props.item),
    },
  });
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.action-menu {
  box-sizing: border-box;

  &__wrap {
    width: 100%;
    height: 72px;
    background: @buttonBg;
    border-radius: 12px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
    padding: 4px;
    box-sizing: border-box;
  }
  &__item {
    display: block;
    text-align: center;
    text-decoration: none;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0.5px;
    color: @primaryLabel;
    cursor: pointer;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    min-width: 100px;
    transition: background 300ms ease-in-out;
    border-radius: 8px;

    &.full {
      width: 100%;

      svg {
        width: 24px;
        height: 24px;
      }
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    svg {
      margin-bottom: 0;
    }
  }
  &__divider {
    height: 48px;
    width: 1px;
    background: @darkBg;
    margin: 0 4px 0 4px;
  }
}
</style>
