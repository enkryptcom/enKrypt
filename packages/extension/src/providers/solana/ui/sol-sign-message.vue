<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
    </template>

    <template #content>
      <h2>Sign message</h2>
      <hardware-wallet-msg :wallet-type="account.walletType" />
      <div class="common-popup__block">
        <div class="common-popup__account">
          <img :src="identicon" />
          <div class="common-popup__account-info">
            <h4>{{ account.name }}</h4>
            <p>
              {{
                $filters.replaceWithEllipsis(
                  account.address
                    ? network.displayAddress(account.address)
                    : '',
                  6,
                  4,
                )
              }}
            </p>
          </div>
        </div>
      </div>
      <div class="common-popup__block">
        <div class="common-popup__info">
          <img :src="Options.faviconURL || network.icon" />
          <div class="common-popup__info-info">
            <h4>{{ Options.title }}</h4>
            <p>{{ Options.domain }}</p>
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
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CommonPopup from '@action/views/common-popup/index.vue';
import HardwareWalletMsg from '@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue';
import { getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { onBeforeMount, ref } from 'vue';
import {
  DEFAULT_SOLANA_NETWORK,
  getNetworkByName,
} from '@/libs/utils/networks';
import { ProviderRequestOptions } from '@/types/provider';
import { SolanaNetwork } from '../types/sol-network';
import { EnkryptAccount, SignerType } from '@enkryptcom/types';
import { SolanaSignInInput } from '@solana/wallet-standard-features';
import bs58 from 'bs58';
import { bufferToHex, hexToBuffer, utf8ToHex } from '@enkryptcom/utils';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { createSignInMessageText } from './libs/signin-message';
import { SolSignInResponse } from './types';
import { isUtf8 } from '@polkadot/util';
import { hexToUtf8 } from 'web3-utils';
import { MessageSigner } from './libs/signer';
import { getRTLOLTLOSafeString } from '@/libs/utils/unicode-detection';

const windowPromise = WindowPromiseHandler(3);
const keyring = new PublicKeyRing();
const network = ref<SolanaNetwork>(DEFAULT_SOLANA_NETWORK);
const account = ref<EnkryptAccount>({
  name: '',
  address: '',
} as EnkryptAccount);
const identicon = ref<string>('');
const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});

const signInMessage = ref<SolanaSignInInput>({});
const signMessage = ref<{ address: string; message: string }>();
const message = ref<string>('');
const reqMethod = ref<'sol_signInMessage' | 'sol_signMessage'>(
  'sol_signInMessage',
);
onBeforeMount(async () => {
  const { Request, Resolve, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![2],
  )) as SolanaNetwork;
  reqMethod.value = Request.value.params![0];
  if (reqMethod.value === 'sol_signInMessage') {
    signInMessage.value = JSON.parse(
      Request.value.params![1],
    ) as SolanaSignInInput;
    message.value = createSignInMessageText(signInMessage.value);
    if (
      signInMessage.value.address &&
      network.value.isAddress(signInMessage.value.address)
    ) {
      const pubKey = bufferToHex(bs58.decode(signInMessage.value.address));
      keyring
        .getAccount(pubKey)
        .then(acc => {
          account.value = acc;
          identicon.value = network.value.identicon(
            network.value.displayAddress(account.value.address),
          );
        })
        .catch(e => {
          console.log(e);
          Resolve.value({
            error: getError(ErrorCodes.unauthorized),
          });
        });
    } else {
      keyring.getAccounts([SignerType.ed25519sol]).then(accs => {
        account.value = accs[0];
        identicon.value = network.value.identicon(
          network.value.displayAddress(account.value.address),
        );
        message.value = createSignInMessageText({
          ...signInMessage.value,
          address: network.value.displayAddress(account.value.address),
        });
      });
    }
  } else if (reqMethod.value === 'sol_signMessage') {
    signMessage.value = JSON.parse(Request.value.params![1]);
    message.value = isUtf8(signMessage.value!.message)
      ? getRTLOLTLOSafeString(hexToUtf8(signMessage.value!.message))
      : signMessage.value!.message;
    keyring
      .getAccount(bufferToHex(bs58.decode(signMessage.value!.address)))
      .then(acc => {
        account.value = acc;
        identicon.value = network.value.identicon(
          network.value.displayAddress(account.value.address),
        );
      })
      .catch(e => {
        console.log(e);
        Resolve.value({
          error: getError(ErrorCodes.unauthorized),
        });
      });
  }
  Options.value = options;
});

const approve = async () => {
  const { Resolve } = await windowPromise;
  MessageSigner({
    account: account.value,
    network: network.value as SolanaNetwork,
    payload: utf8ToHex(message.value),
  })
    .then(res => {
      const resData = JSON.parse(res.result!);
      const response: SolSignInResponse = {
        address: bs58.encode(hexToBuffer(account.value.address)),
        pubkey: account.value.address,
        signature: resData.signature,
        signedMessage: utf8ToHex(message.value),
        signatureType: 'ed25519',
      };
      Resolve.value({
        result: JSON.stringify(response),
      });
    })
    .catch(Resolve.value);
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
