<template>
  <div class="sign-message">
    <sign-logo color="#E6007A" class="sign-message__logo"></sign-logo>
    <h2>Sign message</h2>

    <div class="sign-message__block">
      <div class="sign-message__account">
        <img src="@/ui/action/icons/raw/account.png" />
        <div class="sign-message__account-info">
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
    <div class="sign-message__block">
      <div class="sign-message__info">
        <img src="@/ui/action/icons/raw/matchchain.png" />
        <div class="sign-message__info-info">
          <h4>ZigZag - DEX built on ZK-Rollups</h4>
          <p>https://trade.zigzag.exchange</p>
        </div>
      </div>

      <p class="sign-message__message">
        Please sign this message to connect to Art Blocks. It includes a nonce
        that changes regularly for security purposes: 0
      </p>
    </div>
    <div class="sign-message__buttons">
      <div class="sign-message__buttons-cancel">
        <base-button
          title="Cancel"
          :click="cancelAction"
          :no-background="true"
        />
      </div>
      <div class="sign-message__buttons-send">
        <base-button title="Sign" :click="signAction" />
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

const signAction = () => {
  console.log("signAction");
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.sign-message {
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
  }

  &__message {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 6px 0;
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
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 6px 0;
    margin-bottom: 6px;

    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
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
