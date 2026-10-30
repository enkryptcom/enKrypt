<template>
  <div class="flex flex-col gap-4">
    <img :src="appLogo" class="h-12 mr-auto" />

    <h1 class="text-heading-2xl my-3">Crypto and Stocks<br />In One Wallet.</h1>
    <p class="text-base">
      MEW Extension is the world's best wallet for managing your tokenized
      stocks and crypto assets all in one wallet.
    </p>
    <p class="text-base">
      MEW Extension is an open source wallet built by MyEtherWallet, the team
      that has been helping millions of people with tokenized finance since
      2015.
    </p>

    <app-btn class="mt-3" size="large" @click="createAction"
      >Create a new wallet</app-btn
    >
    <app-btn size="large" type="tertiary" @click="restoreAction"
      >Restore existing wallet</app-btn
    >
  </div>
</template>
<script setup lang="ts">
import appLogo from '@/assets/images/logo.svg';
import AppBtn from '@/components/buttons/AppBtn.vue';
import { routes as cwalletRoutes } from './create-wallet/routes';
import { routes as rwalletRoutes } from './restore-wallet/routes';
import { useRouter } from 'vue-router';

const router = useRouter();

const createAction = () => {
  router.push({ name: cwalletRoutes.pickPassword.name });
};

const restoreAction = () => {
  router.push({ name: rwalletRoutes.start.name });
};
</script>
