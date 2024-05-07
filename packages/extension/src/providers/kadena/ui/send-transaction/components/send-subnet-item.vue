<template>
  <a class="send-subnet-item__subnet" @click="select">
    <div class="send-subnet-item__subnet-info">
      <div class="send-subnet-item__subnet-info-name">
        <h4>{{ subnet.name }}</h4>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { SubNetworkOptions } from "@/types/base-network";

const emit = defineEmits<{
  (e: "update:selectSubnet", subnet: SubNetworkOptions): void;
}>();

const props = defineProps({
  subnet: {
    type: Object as PropType<SubNetworkOptions>,
    default: () => ({}),
  },
});

const select = () => {
  emit("update:selectSubnet", props.subnet);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-subnet-item {
  &__subnet {
    height: 48px;
    margin: 0 8px;
    padding: 0 8px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    cursor: pointer;
    border-radius: 10px;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }

    &-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;

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
  }
}
</style>
