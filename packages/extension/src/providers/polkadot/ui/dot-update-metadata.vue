<template>
  <div class="update-metadata">
    <sign-logo color="#E6007A" class="update-metadata__logo"></sign-logo>
    <h2>Update metadata</h2>

    <div class="update-metadata__block">
      <div class="update-metadata__account">
        <img src="@/ui/action/icons/raw/account.png" />
        <div class="update-metadata__account-info">
          <h4>My account nickname</h4>
          <p>
            {{
              $filters.replaceWithEllipsis(
                "0x14502CF6C0A13167Dc340E25Dabf5FBDB68R5967",
                6,
                4
              )
            }}
          </p>
        </div>
      </div>
    </div>
    <div class="update-metadata__block">
      <div class="update-metadata__block-row">
        <div class="update-metadata__block-row-left">From</div>
        <div class="update-metadata__block-row-right">
          https://polkadot.js.org/apps/?rps=wss%3A%2F%2polkadot-rpc.dwellir.com#/signing
        </div>
      </div>
      <div class="update-metadata__block-row">
        <div class="update-metadata__block-row-left">Chain</div>
        <div class="update-metadata__block-row-right">Polkadot</div>
      </div>
      <div class="update-metadata__block-row">
        <div class="update-metadata__block-row-left">Icon</div>
        <div class="update-metadata__block-row-right">polkadot</div>
      </div>
      <div class="update-metadata__block-row">
        <div class="update-metadata__block-row-left">Decimals</div>
        <div class="update-metadata__block-row-right">10</div>
      </div>
      <div class="update-metadata__block-row">
        <div class="update-metadata__block-row-left">Symbol</div>
        <div class="update-metadata__block-row-right">DOT</div>
      </div>
      <div class="update-metadata__block-row">
        <div class="update-metadata__block-row-left">Upgrade</div>
        <div class="update-metadata__block-row-right">unknown -> 9170</div>
      </div>
    </div>
    <p class="update-metadata__info">
      This approval will add the metadata to your extension instance, allowing
      future request to be decoding using this metadata.
    </p>
    <div class="update-metadata__buttons">
      <div class="update-metadata__buttons-cancel">
        <base-button
          title="Cancel"
          :click="cancelAction"
          :no-background="true"
        />
      </div>
      <div class="update-metadata__buttons-send">
        <base-button title="Update" :click="updateAction" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";

const cancelAction = () => {
  console.log("cancelAction");
};

const updateAction = () => {
  console.log("updateAction");
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.update-metadata {
  width: 100%;

  &__logo {
    margin-bottom: 8px;
  }

  h2 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }

  &__block {
    background: @lightBg;
    border: 1px solid @gray01;
    box-sizing: border-box;
    border-radius: 12px;
    padding: 10px 16px;
    width: 100%;
    margin: 0 0 16px 0;

    &-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-direction: row;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 6px;
      }

      &:first-child {
        margin-top: 6px;
      }

      &-left {
        width: 68px;
        margin-right: 16px;
        text-align: right;
        font-style: normal;
        font-weight: 500;
        font-size: 10px;
        line-height: 11px;
        text-align: right;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: @secondaryLabel;
        padding-top: 6px;
      }

      &-right {
        width: 232px;
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
      }
    }
  }

  &__account {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
      border-radius: 100%;
    }

    &-info {
      h4 {
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        margin: 0;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: @secondaryLabel;
        margin: 0;
        word-break: break-all;
      }
    }
  }

  &__info {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: @secondaryLabel;
    margin: 0 0 16px 0;
    width: 100%;
  }

  &__buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;

    &-cancel {
      width: 108px;
    }

    &-send {
      width: 232px;
    }
  }
}
</style>
