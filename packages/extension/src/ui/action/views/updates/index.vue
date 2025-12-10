<template>
  <div class="updates__container">
    <div class="updates__overlay" @click="close()" />
    <div class="updates__wrap">
      <updates-header @window:close="close" />
      <div>
        <div
          class="updates__block"
          v-for="version in displayVersions"
          :key="version.version"
        >
          <div>
            <a
              :href="version.release_link"
              target="_blank"
              aria-label="Release notes"
              class="updates__block__title"
            >
              <h3>
                v{{ version.version }} <span> {{ getTimeAgo(version) }}</span>
              </h3>
            </a>
            <p v-if="version.description">{{ version.description }}</p>
          </div>
          <div v-if="hasChainsAdded(version)">
            <h4>{{ getChainsTitle(version) }}</h4>
            <updates-network
              v-for="chain in version.chains_added"
              :key="chain"
              :network-id="chain"
            />
          </div>
          <div v-if="hasSwapAdded(version)">
            <h4>{{ getSwapTitle(version) }}</h4>
            <updates-network
              v-for="chain in version.swap_added"
              :key="chain"
              :network-id="chain"
            />
          </div>
          <p
            :class="{
              news_block__end: hasChainsAdded(version) || hasSwapAdded(version),
            }"
          >
            Bug fixes and improvements. <br />
            With love from MEW Team.
          </p>
          <a :href="version.release_link" target="_blank"
            >Full release notes
          </a>
          <p class="updates__block__end">
            Make sure you follow Enkrypt on Twitter (X....ugh) and let us know
            how we can build a better crypto product for you
            <span>
              <a href="https://x.com/enkrypt" target="_blank"
                >https://x.com/enkrypt</a
              ></span
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref } from 'vue';
import UpdatesHeader from './components/updates-header.vue';
import UpdatesNetwork from './components/updates-network.vue';
import { useTimeAgo } from '@vueuse/core';
import { Version } from '@/ui/action/types/updates';
import { trackUpdatesEvents } from '@/libs/metrics';
import { UpdatesEventType } from '@/libs/metrics/types';
import { NetworkNames } from '@enkryptcom/types';
import { useUpdatesStore } from '@/ui/action/store/updates-store';
import { storeToRefs } from 'pinia';

const emit = defineEmits<{
  (e: 'close:popup'): void;
}>();

const props = defineProps({
  currentVersion: {
    required: true,
    type: String,
  },
  currentNetwork: {
    type: String as PropType<NetworkNames>,
    required: true,
  },
});
const updatesStore = useUpdatesStore();
const { releases } = storeToRefs(updatesStore);

/** -------------------
 * Versions
 ------------------- */

const displayVersions = computed(() => {
  if (!releases.value) return [];
  const versions = releases.value.versions;
  const index = versions.findIndex(
    version => version.version === props.currentVersion,
  );
  if (index === -1) {
    return versions.slice(0, 10);
  } else {
    return versions.slice(index, index + 10);
  }
});

const getTimeAgo = (version: Version) => {
  return useTimeAgo(new Date(version.release_date));
};

/** -------------------
 * Chains Added
 * ------------------- */
const hasChainsAdded = (version: Version) => {
  return version.chains_added && version.chains_added.length > 0;
};

const getChainsTitle = (version: Version) => {
  return version.chains_added && version.chains_added.length > 1
    ? 'New chains added:'
    : 'New chain added:';
};
/** -------------------
 * Swap Added
 * ------------------- */
const hasSwapAdded = (version: Version) => {
  return version.swap_added && version.swap_added.length > 0;
};

const getSwapTitle = (version: Version) => {
  return version.swap_added && version.swap_added.length > 1
    ? 'Swap added to chains:'
    : 'Swap added to chain:';
};

/** -------------------
 * Close
 * ------------------- */
const timeOpen = ref<number>(0);

onMounted(() => {
  timeOpen.value = Date.now();
});
const close = () => {
  emit('close:popup');
  const timeSinceOpen = Date.now() - timeOpen.value;
  trackUpdatesEvents(UpdatesEventType.UpdatesClosed, {
    network: props.currentNetwork,
    duration: timeSinceOpen,
  });
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.updates {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    background: @white;
    box-shadow:
      0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 460px;
    height: auto;
    z-index: 107;
    position: relative;
    height: 568px;
    overflow-x: hidden;
    padding-bottom: 16px;
  }

  &__container {
    width: 800px;
    height: 600px;
    left: 0px;
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

  &__block {
    font-size: 14px;
    padding: 0px 64px 40px 32px;
    :not(:first-child) {
    }

    &:nth-child(2) {
      padding-top: 0;
    }
    &__title {
      text-decoration: none;
    }

    h3 {
      font-size: 19px;
      font-weight: 700;
      line-height: 26px;
      margin-bottom: 10px;
      margin-top: 20px;

      span {
        font-size: 11px;
        font-weight: 400;
        line-height: 18px;
        opacity: 0.4;
        padding-left: 8px;
      }
    }

    h4 {
      font-weight: 500;
      margin-bottom: 10px;
    }
    p {
      line-height: 18px;
    }
    &__end {
      margin-top: 20px;
    }
    a {
      color: @black;
    }
  }
}
</style>
