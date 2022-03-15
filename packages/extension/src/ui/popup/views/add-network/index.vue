<template>
  <div class="container">
    <Header />
    <h3 class="add-network__list-header">Popular</h3>

    <Item
      v-for="(item, index) in popular"
      :key="index"
      :network="item"
      :is-active="true"
    ></Item>

    <h3 class="add-network__list-header">All networks</h3>

    <Item
      v-for="(item, index) in all"
      :key="index"
      :network="item"
      :is-active="true"
    ></Item>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Header from "./components/header.vue";
import Item from "./components/item.vue";

export default defineComponent({
  name: "AddNetwork",
  components: {
    Header,
    Item,
  },
  setup() {
    return {
      settings: {
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false,
      },
      popular: [
        {
          id: 1,
          title: "Ethereum",
          image: "https://mpolev.ru/enkrypt/eth-logo.png",
        },
        {
          id: 2,
          title: "Polygon",
          image: "https://mpolev.ru/enkrypt/polygon-logo.png",
        },
        {
          id: 3,
          title: "Polkadot",
          image: "https://mpolev.ru/enkrypt/polkadot.png",
        },
        {
          id: 4,
          title: "Moonbeam",
          image: "https://mpolev.ru/enkrypt/moonbeam.png",
        },
      ],
      all: [
        {
          id: 1,
          title: "Ethereum",
          image: "https://mpolev.ru/enkrypt/eth-logo.png",
        },
        {
          id: 2,
          title: "Polygon",
          image: "https://mpolev.ru/enkrypt/polygon-logo.png",
        },
        {
          id: 3,
          title: "Polkadot",
          image: "https://mpolev.ru/enkrypt/polkadot.png",
        },
        {
          id: 4,
          title: "Moonbeam",
          image: "https://mpolev.ru/enkrypt/moonbeam.png",
        },
        {
          id: 1,
          title: "Ethereum",
          image: "https://mpolev.ru/enkrypt/eth-logo.png",
        },
        {
          id: 2,
          title: "Polygon",
          image: "https://mpolev.ru/enkrypt/polygon-logo.png",
        },
        {
          id: 3,
          title: "Polkadot",
          image: "https://mpolev.ru/enkrypt/polkadot.png",
        },
        {
          id: 4,
          title: "Moonbeam",
          image: "https://mpolev.ru/enkrypt/moonbeam.png",
        },
      ],
    };
  },
});
</script>

<style lang="less" scoped>
@import "../../theme/theme.less";
@import "../../theme/custom-scroll.less";

.container {
  width: 100%;
  height: 600px;
  overflow-x: hidden;
  overflow-y: scroll;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
}
.add-network {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__list {
    &-header {
      font-style: normal;
      font-weight: bold;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 8px 0 0 0;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 460px;
    margin: 8px 0 8px 0;
    padding: 0 32px !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>
