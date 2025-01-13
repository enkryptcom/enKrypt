<template>
  <div v-if="isLoaded" class="news_network">
    <img
      :src="resolvedImg"
      :alt="props.alt"
      :height="40"
      :width="40"
      @error="handleImageError"
      :class="{ 'opacity-0': !isLoaded }"
      class="news_network__icon"
    />
    <p>{{ networkName }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getNetworkByName } from '@/libs/utils/networks';

const props = defineProps({
  networkId: {
    type: String,
    required: true,
  },
  alt: String,
});

const resolvedImg = ref('');
const isLoaded = ref(false);
const networkName = ref('Unknown');

getNetworkByName(props.networkId)
  .then(network => {
    if (network) {
      isLoaded.value = true;
      resolvedImg.value = network.icon;
      networkName.value = network.name_long;
    }
  })
  .catch((error: unknown) => {
    console.error(
      `Failed to load image in news for: ${props.networkId}`,
      error,
    );
    isLoaded.value = false;
    resolvedImg.value = '';
  });

const handleImageError = () => {
  isLoaded.value = false;
};
</script>

<style lang="less">
.news_network {
  display: flex;
  align-items: center;
  padding: 6px 4px;

  &__icon {
    width: 24px;
    height: 24px;
    background-color: white;
    border-radius: 50%;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
    margin-right: 8px;
  }

  p {
    margin: 0;
  }
}
</style>
