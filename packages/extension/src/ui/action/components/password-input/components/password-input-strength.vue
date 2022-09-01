<template>
  <div class="password-input-strength">
    <div class="password-input-strength__bar">
      <div
        v-if="value.length > 0"
        class="password-input-strength__progress"
        :style="{ width: length + '%' }"
        :class="{
          'very-weak': strength == PasswordStrength.veryWeak,
          weak: strength == PasswordStrength.weak,
          medium: strength == PasswordStrength.medium,
          strong: strength == PasswordStrength.strong,
          'very-strong': strength == PasswordStrength.veryStrong,
        }"
      />
    </div>

    <p
      v-if="strength == PasswordStrength.veryWeak && value.length > 0"
      class="password-input-strength__label very-weak visible visible"
    >
      Very weak
    </p>

    <p
      v-if="strength == PasswordStrength.weak"
      class="password-input-strength__label weak visible visible"
    >
      Weak
    </p>

    <p
      v-if="strength == PasswordStrength.medium"
      class="password-input-strength__label medium visible visible"
    >
      Medium
    </p>

    <p
      v-if="strength == PasswordStrength.strong"
      class="password-input-strength__label strong visible visible"
    >
      Strong
    </p>

    <p
      v-if="strength == PasswordStrength.veryStrong"
      class="password-input-strength__label very-strong visible"
    >
      Very strong
    </p>

    <a
      v-if="value.length > 0"
      class="password-input-strength__help visible"
      @mouseenter="toggleTooltip"
      @mouseleave="toggleTooltip"
    >
      <help-icon />
      <div v-if="isTooltip" class="password-input-strength__help-tooltip">
        <p>Your password would be cracked</p>
        <h4 v-if="strength == PasswordStrength.veryWeak" class="weak">
          {{ toolTipInfo }}
        </h4>
        <h4 v-if="strength == PasswordStrength.weak" class="weak">
          {{ toolTipInfo }}
        </h4>
        <h4 v-if="strength == PasswordStrength.medium" class="medium">
          {{ toolTipInfo }}
        </h4>
        <h4
          v-if="
            strength == PasswordStrength.strong ||
            strength == PasswordStrength.veryStrong
          "
          class="strong"
        >
          {{ toolTipInfo }}
        </h4>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import HelpIcon from "@action/icons/password/help-icon.vue";
import { PasswordStrength } from "@action/types/password";
import zxcvbn from "zxcvbn";
import { computed } from "@vue/reactivity";

const length = ref(2);
const isTooltip = ref(false);
const toolTipInfo = ref("");
const props = defineProps({
  value: {
    type: String,
    default: "",
  },
});
const emit = defineEmits<{
  (
    e: "update:strengthAndPassword",
    info: { password: string; strength: number }
  ): void;
}>();
const strength = computed(() => {
  const passStrength = zxcvbn(props.value);
  toolTipInfo.value =
    passStrength.crack_times_display.offline_slow_hashing_1e4_per_second.toString();
  if (passStrength.score === 4) {
    length.value = 100;
    return PasswordStrength.veryStrong;
  } else if (passStrength.score === 3) {
    length.value = 84;
    return PasswordStrength.strong;
  } else if (passStrength.score === 2) {
    length.value = 42;
    return PasswordStrength.medium;
  } else if (passStrength.score === 1) {
    length.value = 21;
    return PasswordStrength.weak;
  } else {
    length.value = 4;
    return PasswordStrength.veryWeak;
  }
});
watch([strength, props], () => {
  emit("update:strengthAndPassword", {
    password: props.value,
    strength: strength.value,
  });
});
const toggleTooltip = () => {
  isTooltip.value = !isTooltip.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.password-input-strength {
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
      height: 110px;
      background: @white;
      box-shadow: 0px 0.5px 1.75px rgba(0, 0, 0, 0.039),
        0px 1.85px 6.25px rgba(0, 0, 0, 0.19);
      border-radius: 12px;
      padding: 12px 16px;
      position: absolute;
      right: -2px;
      bottom: -112px;
      box-sizing: border-box;
      z-index: 3;

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
