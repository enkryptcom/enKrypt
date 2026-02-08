<template>
  <component
    :is="isWindowPopup ? 'div' : AppDialog"
    v-model="model"
    is-centered
    width="320px"
  >
    <div
      :class="{
        'anonymize-state__container anonymize-state__container__popup':
          isWindowPopup,
      }"
    >
      <div class="anonymize-state">
        <div class="anonymize-state__wrap">
          <div class="anonymize-state__checks">
            <div class="anonymize-state__checks__item">
              <done-icon
                v-if="!isCoinSyncing"
                class="anonymize-state__checks__item__checked"
              />
              <info-icon
                v-else
                class="anonymize-state__checks__item__pending"
              />
              <span v-if="!isCoinSyncing">Coins synchronized</span>
              <span v-else>Coins synchronizing...</span>
            </div>
            <div class="anonymize-state__checks__item">
              <done-icon
                v-if="!isTagSyncing"
                class="anonymize-state__checks__item__checked"
              />
              <info-icon
                v-else
                class="anonymize-state__checks__item__pending"
              />
              <span v-if="!isTagSyncing">Tags synchronized</span>
              <span v-else>Tags synchronizing...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import AppDialog from '@action/components/app-dialog/index.vue';
import DoneIcon from '@action/icons/common/done_icon.vue';
import InfoIcon from '@action/icons/common/info-icon.vue';

defineProps({
  isCoinSyncing: {
    type: Boolean,
    default: false,
  },
  isTagSyncing: {
    type: Boolean,
    default: false,
  },
  isWindowPopup: Boolean,
});

const model = defineModel<boolean>();
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.anonymize-state {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  &__container {
    width: 800px;
    height: 600px;
    background: rgba(0, 0, 0, 0.32);
    margin: 0;
    box-sizing: border-box;
    position: absolute;
    z-index: 101;
    top: 0;
    &__popup {
      left: -195px;
    }
  }

  &__wrap {
    position: relative;
    background: @white;
    width: 320px;
    height: 100%;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
    border-radius: 12px;
    z-index: 102;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 36px 0 36px;
    gap: 10px;
  }

  &__checks {
    width: 100%;
    max-width: 150px;
    height: 60px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &__item {
      display: flex;
      align-items: center;
      gap: 4px;

      &__checked,
      &__pending {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
