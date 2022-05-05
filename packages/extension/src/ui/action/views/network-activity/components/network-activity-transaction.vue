<template>
  <a href="#" class="network-activity__transaction">
    <div class="network-activity__transaction-info">
      <img src="@action/icons/raw/account.png" />

      <div class="network-activity__transaction-info-name">
        <h4>
          {{ $filters.replaceWithEllipsis(transaction.from.address, 6, 6) }}
        </h4>
        <p>
          <span
            class="network-activity__transaction-info-status"
            :class="{ error: transaction.status == 2 }"
            >{{ status }}</span
          >
          <transaction-timer
            v-if="transaction.status == 0"
            :date="transaction.date"
          />
          <span v-else>{{ date }}</span>
        </p>
      </div>
    </div>

    <div class="network-activity__transaction-amount">
      <h4>
        {{ transaction.cryptoAmount }}
        <span>{{ transaction.token.symbol }}</span>
      </h4>
      <p>{{ $filters.formatFiatValue(transaction.amount).value }}</p>
    </div>
  </a>
</template>

<script lang="ts">
export default {
  name: "NetworkActivityTransaction",
};
</script>

<script setup lang="ts">
import { PropType } from "vue";
import {
  Transaction,
  TransactionStatus,
  TransactionDirection,
} from "@action/types/transaction";
import moment from "moment";
import TransactionTimer from "./transaction-timer.vue";

const props = defineProps({
  transaction: {
    type: Object as PropType<Transaction>,
    default: () => ({}),
  },
});

let status = "";
let date = "";

if (props.transaction) {
  date = moment(props.transaction.date).fromNow();

  switch (props.transaction.direction) {
    case TransactionDirection.incoming:
      switch (props.transaction.status) {
        case TransactionStatus.progress:
          status = "Receiving";
          break;
        case TransactionStatus.success:
          status = "Receive";
          break;
        case TransactionStatus.failed:
          status = "Failed";
          break;
      }
      break;
    case TransactionDirection.outgoing:
      switch (props.transaction.status) {
        case TransactionStatus.progress:
          status = "Sending";
          break;
        case TransactionStatus.success:
          status = "Sent";
          break;
        case TransactionStatus.failed:
          status = "Failed";
          break;
      }
      break;
  }
}
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-activity {
  &__transaction {
    height: 64px;
    padding: 0 20px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    text-decoration: none;
    cursor: pointer;

    &-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;

      img {
        max-width: 32px;
        margin-right: 16px;
        border-radius: 100%;
      }

      &-name {
        h4 {
          font-style: normal;
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
          color: @primaryLabel;
          margin: 0 0 1px 0;
        }

        p {
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.5px;
          color: @secondaryLabel;
          margin: 0;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          flex-direction: row;

          .error {
            color: @error;
          }
        }
      }

      &-status {
        margin-right: 4px;
      }
    }

    &-amount {
      text-align: right;

      h4 {
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        text-align: right;
        color: @primaryLabel;
        margin: 0 0 1px 0;

        span {
          font-variant: small-caps;
        }
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: @secondaryLabel;
        margin: 0;
      }
    }
  }
}
</style>
