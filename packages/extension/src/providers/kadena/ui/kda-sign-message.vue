<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
      <div class="common-popup__network">
        <img :src="network.icon" />
        <p>{{ network.name_long }}</p>
      </div>
    </template>

    <template #content>
      <h2>Sign message</h2>

      <div class="common-popup__block">
        <div class="common-popup__account">
          <img :src="network.identicon(account.address)" />
          <div class="common-popup__account-info">
            <h4>{{ account.name }}</h4>
            <p>
              {{ $filters.replaceWithEllipsis(account.address, 6, 4) }}
            </p>
          </div>
        </div>
      </div>
      <div class="common-popup__block">
        <div class="common-popup__info">
          <img :src="Options.faviconURL" />
          <div class="common-popup__info-info">
            <h4>{{ Options.domain }}</h4>
          </div>
        </div>

        <p class="common-popup__message">
          {{ message }}
        </p>
      </div>
    </template>

    <template #button-left>
      <base-button title="Cancel" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Sign" :click="approve" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { blake2AsU8a } from '@polkadot/util-crypto';
import { bufferToHex } from '@enkryptcom/utils';
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CommonPopup from '@action/views/common-popup/index.vue';
import { getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { onBeforeMount, ref } from 'vue';
import { ProviderRequestOptions } from '@/types/provider';
import { EnkryptAccount } from '@enkryptcom/types';
import { TransactionSigner } from './libs/signer';
import { KadenaNetwork } from '../types/kadena-network';
import {
  DEFAULT_KADENA_NETWORK,
  getNetworkByName,
} from '@/libs/utils/networks';
import { getRTLOLTLOSafeString } from '@/libs/utils/unicode-detection';

const windowPromise = WindowPromiseHandler(0);
const network = ref<KadenaNetwork>(DEFAULT_KADENA_NETWORK);

const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});
const message = ref('');
const account = ref({ address: '' } as EnkryptAccount);

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  Options.value = options;
  message.value = getRTLOLTLOSafeString(Request.value.params![0].data);
  account.value = Request.value.params![1] as EnkryptAccount;
  network.value = (await getNetworkByName(
    Request.value.params![0].network,
  )) as KadenaNetwork;
});

const approve = async () => {
  const { Request, Resolve } = await windowPromise;

  const msg = Request.value.params![0];
  const account = Request.value.params![1] as EnkryptAccount;

  TransactionSigner({
    account,
    network: network.value,
    payload: bufferToHex(blake2AsU8a(msg.data)),
  })
    .then(res => {
      Resolve.value({
        result: res.result?.replace('0x', '') as string,
      });
    })
    .catch(er => {
      Resolve.value({
        error: getError(er),
      });
    });
};
const deny = async () => {
  const { Resolve } = await windowPromise;

  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less" scoped>
@import '@/providers/ethereum/ui/styles/common-popup.less';
</style>
