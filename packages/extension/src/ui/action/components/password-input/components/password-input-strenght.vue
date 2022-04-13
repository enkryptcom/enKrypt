<template>
  <div class="password-input-strenght">
    <div class="password-input-strenght__bar">
      <div
        v-if="value.length > 0"
        class="password-input-strenght__progress"
        :style="{ width: length + '%' }"
        :class="{
          'very-weak': strenght == PasswordStrength.veryWeak,
          weak: strenght == PasswordStrength.weak,
          medium: strenght == PasswordStrength.medium,
          strong: strenght == PasswordStrength.strong,
          'very-strong': strenght == PasswordStrength.veryStrong,
        }"
      ></div>
    </div>

    <p
      v-if="strenght == PasswordStrength.veryWeak"
      class="password-input-strenght__label very-weak"
      :class="{ visible: value.length > 0 }"
    >
      Very weak
    </p>

    <p
      v-if="strenght == PasswordStrength.weak"
      class="password-input-strenght__label weak"
      :class="{ visible: value.length > 0 }"
    >
      Weak
    </p>

    <p
      v-if="strenght == PasswordStrength.medium"
      class="password-input-strenght__label medium"
      :class="{ visible: value.length > 0 }"
    >
      Medium
    </p>

    <p
      v-if="strenght == PasswordStrength.strong"
      class="password-input-strenght__label strong"
      :class="{ visible: value.length > 0 }"
    >
      Strong
    </p>

    <p
      v-if="strenght == PasswordStrength.veryStrong"
      class="password-input-strenght__label very-strong"
      :class="{ visible: value.length > 0 }"
    >
      Very strong
    </p>

    <a
      class="password-input-strenght__help"
      :class="{ visible: value.length > 0 }"
      @click="toggleTooltip"
    >
      <help-icon />
    </a>

    <div v-if="isTooltip" class="password-input-strenght__help-tooltip">
      <p>Your password would be cracked</p>
      <h4 v-if="strenght == PasswordStrength.veryWeak" class="weak">
        Instantly
      </h4>
      <h4 v-if="strenght == PasswordStrength.weak" class="weak">1 minute</h4>
      <h4 v-if="strenght == PasswordStrength.medium" class="medium">5 years</h4>
      <h4
        v-if="
          strenght == PasswordStrength.strong ||
          strenght == PasswordStrength.veryStrong
        "
        class="strong"
      >
        2 million years
      </h4>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "PasswordInputStrenght",
};
</script>

<script setup lang="ts">
import { onUpdated, ref } from "vue";
import HelpIcon from "@action/icons/password/help-icon.vue";
import { PasswordStrength } from "@action/types/password";

let length = ref(2);
let strenght = ref(PasswordStrength.veryWeak);
let isTooltip = ref(false);

const props = defineProps({
  value: {
    type: String,
    default: () => {
      return "";
    },
  },
});

onUpdated(() => {
  testPassword(props.value);
});

const testPassword = (password: string) => {
  if (password.length > 7) {
    length.value = 100;
    strenght.value = PasswordStrength.veryStrong;
  } else if (password.length > 6) {
    length.value = 84;
    strenght.value = PasswordStrength.strong;
  } else if (password.length > 5) {
    length.value = 42;
    strenght.value = PasswordStrength.medium;
  } else if (password.length > 4) {
    length.value = 21;
    strenght.value = PasswordStrength.weak;
  } else if (password.length > 0) {
    length.value = 4;
    strenght.value = PasswordStrength.veryWeak;
  }
};

const toggleTooltip = () => {
  isTooltip.value = !isTooltip.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.password-input-strenght {
  margin: 0 0 16px 0;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  padding: 0 8px;

  &__bar {
    height: 2px;
    width: 100%;
    background: rgba(95, 99, 104, 0.1);
    border-radius: 4px;
    position: relative;
    margin-bottom: 4px;
  }

  &__progress {
    position: absolute;
    height: 2px;
    left: 0;
    bottom: 0;
    border-radius: 4px;
    -webkit-transition: width 0.3s ease-in-out;
    -moz-transition: width 0.3s ease-in-out;
    -ms-transition: width 0.3s ease-in-out;
    -o-transition: width 0.3s ease-in-out;
    transition: width 0.3s ease-in-out;

    &.very-weak {
      background: @error;
    }

    &.weak {
      background: @error;
    }

    &.medium {
      background: @orange;
    }

    &.strong {
      background: @primary;
    }

    &.very-strong {
      background: @primary;
    }
  }

  &__label {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    margin: 0 0 2px 0;
    padding-left: 4px;
    opacity: 0;

    &.visible {
      opacity: 1;
    }

    &.very-weak {
      color: @error;
    }

    &.weak {
      color: @error;
    }

    &.medium {
      color: @orange;
    }

    &.strong {
      color: @primary;
    }

    &.very-strong {
      color: @primary;
    }
  }

  &__help {
    position: absolute;
    bottom: 2px;
    right: 12px;
    opacity: 0;
    cursor: pointer;

    &.visible {
      opacity: 1;
    }

    &:active {
      opacity: 0.7;
    }

    &-tooltip {
      width: 197px;
      height: 92px;
      background: @white;
      box-shadow: 0px 0.5px 1.75px rgba(0, 0, 0, 0.039),
        0px 1.85px 6.25px rgba(0, 0, 0, 0.19);
      border-radius: 12px;
      padding: 12px 16px;
      position: absolute;
      right: 4px;
      bottom: -94px;
      box-sizing: border-box;

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        margin: 0;
      }

      h4 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 28px;
        letter-spacing: 0.15px;
        margin: 0;
        color: @error;

        &.weak {
          color: @error;
        }

        &.medium {
          color: @orange;
        }

        &.strong {
          color: @primary;
        }
      }
    }
  }
}
</style>
