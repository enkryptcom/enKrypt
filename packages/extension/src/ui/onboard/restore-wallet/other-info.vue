<template>
  <div class="restore-wallet-other-info">
    <custom-scrollbar
      class="restore-wallet-other-info__scroll-area"
      :settings="scrollSettings({ suppressScrollX: true })"
    >
      <h3>Your safety and security is our #1 priority</h3>
      <p>
        We don't support keystore file and private key imports in Enkrypt, as
        they are highly unsafe.
      </p>
      <p>
        (Note that keystore file and private key are still available methods of
        access on MyEtherWallet.com, but are not recommended unless using MEW
        offline)
      </p>
      <p>
        For maximum security its best to create a new wallet directly in
        Enkrypt, same as if you just got a new hardware wallet. That way you can
        be sure your keys never leave your device.
      </p>
      <p>
        If you want to access funds in one of your existing wallets via Enkrypt,
        the most secure way is to create a new wallet and transfer your ETH and
        Tokens to the new wallet.
      </p>
      <p>Using your existing private key considerably reduces your security.</p>
    </custom-scrollbar>
  </div>
</template>
<script setup lang="ts">
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import scrollSettings from "@/libs/utils/scroll-settings";
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.restore-wallet-other-info {
  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
    margin: 0 0 16px 0;
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: calc(~"100% + 15px");
    max-height: 488px;
    padding-right: 15px;
    box-sizing: border-box;
  }
}
</style>
