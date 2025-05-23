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
      <h2>Verify transaction</h2>
      <hardware-wallet-msg :wallet-type="account.walletType" />
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__account">
          <img :src="identicon" />
          <div class="provider-verify-transaction__account-info">
            <h4>{{ account.name }}</h4>
            <div>
              <p>
                {{
                  TokenBalance == '~'
                    ? '~'
                    : $filters.formatFloatingPointValue(TokenBalance).value
                }}
                <span>{{ network.currencyName }}</span>
              </p>
              <p>
                {{
                  $filters.replaceWithEllipsis(
                    network.displayAddress(account.address),
                    6,
                    4,
                  )
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img :src="Options.faviconURL || network.icon" />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ Options.domain }}</h4>
          </div>
        </div>
        <swap-looking-animation
          v-if="(!decodedTx || !decodedTx.length) && !errorMsg"
          style="height: 100px; margin-left: 100px"
        />
        <div v-if="decodedTx?.length">
          <div
            v-for="(item, index) in decodedTx"
            :key="index"
            class="provider-verify-transaction__amount"
          >
            <img :src="item.icon || network.icon" />

            <div class="provider-verify-transaction__amount-info">
              <h4 :class="item.isNegative ? 'make-me-red' : ''">
                {{ item.isNegative ? '-' : '' }}
                {{
                  $filters.formatFloatingPointValue(
                    fromBase(item.change.toString(), item.decimals),
                  ).value
                }}
                <span>{{ item.symbol }}</span>
              </h4>
              <p :class="item.isNegative ? 'make-me-red' : ''">
                {{ item.isNegative ? '-' : '' }}
                {{ $filters.parseCurrency(parseFloat(item.USDval)) }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="!decodedTx" class="provider-verify-transaction__error">
          <alert-icon />
          <p>
            Warning: This transaction failed during simulation, which means this
            transaction will most likely fail! We recommend to cancel and try
            again!
          </p>
        </div>
      </div>

      <send-fee-select
        style="margin-left: 0px"
        :in-swap="false"
        :selected="selectedFee"
        :fee="gasCostValues[selectedFee]"
      />
      <p v-if="errorMsg != ''" class="provider-verify-transaction__error">
        {{ errorMsg }}
      </p>
    </template>

    <template #button-left>
      <base-button
        title="Decline"
        :click="deny"
        :no-background="true"
        :disabled="isProcessing"
      />
    </template>

    <template #button-right>
      <base-button
        title="Send"
        :click="approve"
        :disabled="isProcessing || errorMsg != ''"
      />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { ref, ComponentPublicInstance, onBeforeMount } from 'vue';
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CommonPopup from '@action/views/common-popup/index.vue';
import SendFeeSelect from './send-transaction/components/send-fee-select.vue';
import HardwareWalletMsg from '@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue';
import { getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import SwapLookingAnimation from '@action/icons/swap/swap-looking-animation.vue';
import {
  DEFAULT_SOLANA_NETWORK,
  getNetworkByName,
} from '@/libs/utils/networks';
import { ProviderRequestOptions } from '@/types/provider';
import BigNumber from 'bignumber.js';
import { GasFeeType, GasPriceTypes } from '@/providers/common/types';
import MarketData from '@/libs/market-data';
import { defaultGasCostVals } from '@/providers/common/libs/default-vals';
import { EnkryptAccount } from '@enkryptcom/types';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import ActivityState from '@/libs/activity-state';
import { fromBase, bufferToHex, hexToBuffer } from '@enkryptcom/utils';
import AlertIcon from '@action/icons/send/alert-icon.vue';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import { SolanaNetwork } from '../types/sol-network';
import SolanaAPI from '@/providers/solana/libs/api';
import {
  PublicKey,
  SendOptions,
  VersionedTransaction,
  Transaction as LegacyTransaction,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import { SolSignTransactionRequest } from './types';
import bs58 from 'bs58';
import DecodeTransaction, { DecodedTxResponseType } from './libs/decode-tx';
import { TransactionSigner } from './libs/signer';
import { NATIVE_TOKEN_ADDRESS } from '@/providers/ethereum/libs/common';
import getPrioritizationFees from './libs/get-priority-fees';

const isProcessing = ref(false);
const providerVerifyTransactionScrollRef = ref<ComponentPublicInstance>();
const TokenBalance = ref<string>('~');
const network = ref<SolanaNetwork>(DEFAULT_SOLANA_NETWORK);
const marketdata = new MarketData();
const activityState = new ActivityState();
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const decodedTx = ref<DecodedTxResponseType[] | null>([]);
const errorMsg = ref('');
const account = ref<EnkryptAccount>({
  name: '',
  address: '',
} as EnkryptAccount);
const identicon = ref<string>('');
const windowPromise = WindowPromiseHandler(5);
const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.ECONOMY);
const solConnection = ref<SolanaAPI>();
const Tx = ref<VersionedTransaction | LegacyTransaction>();
const TxType = ref<'legacy' | 0>(0);
const accountPubkey = ref<PublicKey>();
const sendOptions = ref<SendOptions>({});
const payloadMethod = ref<'sol_signTransaction' | 'sol_signAndSendTransaction'>(
  'sol_signTransaction',
);
defineExpose({ providerVerifyTransactionScrollRef });
onBeforeMount(async () => {
  isProcessing.value = true;
  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![4],
  )) as SolanaNetwork;
  selectedFee.value = GasPriceTypes.ECONOMY;
  account.value = Request.value.params![3] as EnkryptAccount;
  accountPubkey.value = new PublicKey(
    bs58.encode(hexToBuffer(account.value.address)),
  );
  identicon.value = network.value.identicon(
    network.value.displayAddress(account.value.address),
  );
  Options.value = options;
  if (network.value.api) {
    const api = await network.value.api();
    const balance = await api.getBalance(account.value.address);
    TokenBalance.value = fromBase(balance, network.value.decimals);
  }
  solConnection.value = (await network.value.api()).api as SolanaAPI;
  payloadMethod.value = Request.value.params![0];
  const txMessage = JSON.parse(
    Request.value.params![1],
  ) as SolSignTransactionRequest;
  sendOptions.value = JSON.parse(Request.value.params![2]) as SendOptions;
  Tx.value = VersionedTransaction.deserialize(hexToBuffer(txMessage.hex));
  TxType.value = Tx.value.version;
  if (TxType.value === 'legacy') {
    Tx.value = LegacyTransaction.from(hexToBuffer(txMessage.hex));
    let isPriorityFeesSet = false;
    Tx.value.instructions.forEach(i => {
      if (i.programId.toBase58() === ComputeBudgetProgram.programId.toBase58())
        isPriorityFeesSet = true;
    });
    const priorityFee = await getPrioritizationFees(
      network.value as SolanaNetwork,
    );
    if (!isPriorityFeesSet && !!priorityFee) {
      Tx.value.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: priorityFee.high,
        }),
      );
    }
  }
  const feeMessage =
    TxType.value === 'legacy'
      ? (Tx.value as LegacyTransaction).compileMessage()
      : (Tx.value as VersionedTransaction).message;
  solConnection.value.web3.getFeeForMessage(feeMessage).then(fee => {
    const getConvertedVal = () =>
      fromBase(fee.value!.toString(), network.value.decimals);
    marketdata
      .getTokenValue('1', network.value.coingeckoID!, 'USD')
      .then(val => {
        const nativeVal = val;
        gasCostValues.value[GasPriceTypes.ECONOMY] = {
          nativeValue: getConvertedVal(),
          fiatValue: new BigNumber(getConvertedVal())
            .times(nativeVal!)
            .toString(),
          nativeSymbol: network.value.currencyName,
          fiatSymbol: 'USD',
        };
      });
  });

  DecodeTransaction(
    Tx.value,
    accountPubkey.value,
    network.value as SolanaNetwork,
    TxType.value,
  )
    .then(vals => {
      decodedTx.value = vals;
    })
    .finally(() => (isProcessing.value = false));
});

const approve = async () => {
  const { Resolve } = await windowPromise;
  isProcessing.value = true;
  trackSendEvents(SendEventType.SendAPIApprove, {
    network: network.value.name,
  });
  const latestBlockHash = (await solConnection.value!.web3.getLatestBlockhash())
    .blockhash;
  if (
    TxType.value === 'legacy' &&
    !(Tx.value as LegacyTransaction).recentBlockhash
  ) {
    (Tx.value as LegacyTransaction).recentBlockhash = latestBlockHash;
  } else if (
    TxType.value !== 'legacy' &&
    !(Tx.value as VersionedTransaction).message.recentBlockhash
  ) {
    (Tx.value as VersionedTransaction).message.recentBlockhash =
      latestBlockHash;
  }
  const msgToSign =
    TxType.value !== 'legacy'
      ? (Tx.value! as VersionedTransaction).message.serialize()
      : (Tx.value! as LegacyTransaction).serializeMessage();
  const feePayer = new PublicKey(
    network.value.displayAddress(account.value.address),
  );
  TransactionSigner({
    account: account.value,
    network: network.value,
    transaction: Buffer.from(msgToSign),
  })
    .then(res => {
      Tx.value!.addSignature(feePayer, res);
      const toData =
        decodedTx.value && decodedTx.value.length ? decodedTx.value[0] : null;
      const TransactionHash =
        TxType.value !== 'legacy'
          ? (Tx.value as VersionedTransaction).signatures[0]
          : (Tx.value as LegacyTransaction).signatures[0].signature;
      const txActivity: Activity = {
        from: accountPubkey.value!.toBase58(),
        to: toData ? toData.contract : accountPubkey.value!.toBase58(),
        isIncoming: false,
        network: network.value.name,
        status: ActivityStatus.pending,
        timestamp: new Date().getTime(),
        token: {
          decimals: toData ? toData.decimals : network.value.decimals,
          icon: toData ? toData.icon : network.value.icon,
          name: toData ? toData.name : network.value.currencyNameLong,
          symbol: toData ? toData.symbol : network.value.currencyName,
          price: toData ? toData.price : '0',
        },
        type: ActivityType.transaction,
        value: toData ? toData.change.toString() : '0',
        transactionHash: bs58.encode(TransactionHash!),
      };
      txActivity.to =
        txActivity.to === NATIVE_TOKEN_ADDRESS
          ? '11111111111111111111111111111111'
          : txActivity.to;
      activityState
        .addActivities(
          [
            {
              ...txActivity,
              ...{
                isIncoming: txActivity.from === txActivity.to,
              },
            },
          ],
          {
            address: txActivity.from,
            network: network.value.name,
          },
        )
        .then(() => {
          trackSendEvents(SendEventType.SendAPIComplete, {
            network: network.value.name,
          });
          if (payloadMethod.value === 'sol_signTransaction') {
            Resolve.value({
              result: JSON.stringify(bufferToHex(Tx.value!.serialize())),
            });
          } else {
            solConnection.value?.web3
              .sendRawTransaction(Tx.value!.serialize(), sendOptions.value)
              .then(sig => {
                Resolve.value({
                  result: JSON.stringify(bufferToHex(bs58.decode(sig))),
                });
              });
          }
        });
    })
    .catch(err => {
      trackSendEvents(SendEventType.SendAPIFailed, {
        network: network.value.name,
      });
      Resolve.value(err);
    });
};
const deny = async () => {
  trackSendEvents(SendEventType.SendAPIDecline, {
    network: network.value.name,
  });
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less">
@import '@action/styles/theme.less';
@import '@/providers/common/ui/styles/verify-transaction.less';
.make-me-red {
  color: #f0580c !important;
}
</style>
