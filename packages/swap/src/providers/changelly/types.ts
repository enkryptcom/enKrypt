import { TokenType } from "../../types";

export interface ChangellyCurrency {
  name: string;
  ticker: string;
  fullName: string;
  enabled: boolean;
  enabledFrom: boolean;
  enabledTo: boolean;
  fixRateEnabled: boolean;
  payinConfirmations: number;
  addressUrl: string;
  transactionUrl: string;
  image: string;
  protocol: string;
  blockchain: string;
  contractAddress?: string;
  token?: TokenType;
}

// Changelly's API is Json RPC

export type ChangellyApiOkResponse<T> = {
  id: string | number;
  jsonrpc: "2.0";
  result: T;
  error?: undefined;
};
export type ChangellyApiErrResponse = {
  id: string | number;
  jsonrpc: "2.0";
  result?: undefined;
  error: {
    message: string;
    code: number;
  };
};

export type ChangellyApiResponse<T> =
  | ChangellyApiOkResponse<T>
  | ChangellyApiErrResponse;

/**
 * @see https://docs.changelly.com/validate-address#request
 *
 * @example
 * ```sh
 * # Valid address
 * curl -sL https://partners.mewapi.io/changelly-v2 -X POST -H Accept:application/json -H Content-Type:application/json --data '{"id":"1","jsonrpc":"2.0","method":"validateAddress","params":{"currency":"sol","address":"CMGoYEKM8kSXwN9HzYiwRiZRXoMtEAQ98ZiPE9y67T38"}}' | jq '.' -C | less -R
 * # {
 * #   "jsonrpc": "2.0",
 * #   "result": {
 * #     "result": true
 * #   },
 * #   "id": "1"
 * # }
 *
 * # Invalid address
 * curl -sL https://partners.mewapi.io/changelly-v2 -X POST -H Accept:application/json -H Content-Type:application/json --data '{"id":"1","jsonrpc":"2.0","method":"validateAddress","params":{"currency":"sol","address":"CMGoYEKM8kSXwN9HzYiwRiZRXoMtEAQ98ZiPE9y67T38zzzzzz"}}' | jq '.' -C | less -R
 * # {
 * #   "jsonrpc": "2.0",
 * #   "result": {
 * #     "result": false,
 * #     "message": "Invalid address"
 * #   },
 * #   "id": "1"
 * # }
 * ```
 */
export type ChangellyApiValidateAddressParams = {
  /**
   * Currency ticker (in lowercase).
   *
   * @example "sol"
   */
  currency: string;

  /**
   * Wallet address.
   *
   * @example "CMGoYEKM8kSXwN9HzYiwRiZRXoMtEAQ98ZiPE9y67T38"
   */
  address: string;

  /** Extra ID. */
  extraId?: string;
};

/** @see https://docs.changelly.com/validate-address#response */
export type ChangellyApiValidateAddressResult = {
  /**
   * Is true if the given address is valid.
   */
  result: boolean;

  /**
   * Error message which is returned only if the given address is invalid.
   *
   * @example "Invalid address"
   */
  message?: string;
};

/**
 * @see https://docs.changelly.com/fix/get-fix-rate#request
 *
 * @note The method is deprecated. Use getFixRateForAmount instead.
 *
 * @example
 * ```sh
 * # SOL to BTC
 * curl -sL https://partners.mewapi.io/changelly-v2 -X POST -H Accept:application/json -H Content-Type:application/json --data '{"id":"1","jsonrpc":"2.0","method":"getFixRate","params":{"from":"sol","to":"btc"}}' | jq . -C | less -R
 * # {
 * #   "jsonrpc": "2.0",
 * #   "result": [
 * #     {
 * #       "id": "RmELQQZ@MP0WIcD55XEjyVmieqsk@z",
 * #       "from": "sol",
 * #       "to": "btc",
 * #       "result": "0.002190975020",
 * #       "networkFee": "0.00001909",
 * #       "max": "700.00000000",
 * #       "maxFrom": "700.00000000",
 * #       "maxTo": "1.57946710",
 * #       "min": "0.80000000",
 * #       "minFrom": "0.80000000",
 * #       "minTo": "0.00180510",
 * #       "expiredAt": 1726539462
 * #     }
 * #   ],
 * #   "id": "1"
 * # }
 *
 * # DAI to USDC
 * curl https://partners.mewapi.io/changelly-v2 -sL -X POST -H 'Accept: application/json' -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","id":"1","method":"getFixRate","params":{"from":"dai","to":"usdc"}}' | jq . -C | less -R
 * ````
 */
export type ChangellyApiGetFixRateParams = {
  /**
   * Payin currency code (in lowercase).
   *
   * @example "sol"
   */
  from: string;

  /**
   * Payout currency code (in lowercase).
   *
   * @example "btc"
   * */
  to: string;
};

/**
 * @see https://docs.changelly.com/fix/get-fix-rate#response
 *
 * @note The method is deprecated. Use getFixRateForAmount instead.
 */
export type ChangellyApiGetFixRateResult = Array<{
  /**
   * Rate ID that can be used during 1 minute.
   * This time should be enough for user to initiate the exchange.
   * Expired rate id cannot be used for creation of the fixed rate transaction.
   *
   * id has to be stored somewhere. It will be used as rateId value while calling.
   *
   * @example "LT^rql0B^5QcM^pETcEZaBZ652v#*s"
   */
  id: string;

  /**
   * Exchange rate before withholding the network fee.
   *
   * Important. To calculate the exact amount that the user will get, you need
   * to multiply the amount that the user wants to send to the result and deduct
   * the value of the networkFee.
   *
   * @example "0.002191084078"
   */
  result: string;

  /**
   * Payin currency code.
   *
   * @example "sol"
   */
  from: string;

  /**
   * Payout currency code.
   *
   * @example "btc"
   */
  to: string;

  /**
   * Commission taken by the network from the amount sent to the user.
   * For one-step exchange, displayed in pay-out currency.
   * For two-step exchanges, displayed in BTC or in USDT.
   *
   * @example "0.00001909"
   */
  networkFee: string;

  /**
   * Maximum exchangeable amount.
   *
   * "700.00000000"
   */
  max: string;

  /**
   * Maximum payin amount for which we would be able to perform the exchange.
   *
   * @example "700.00000000"
   */
  maxFrom: string;

  /**
   * Maximum payout amount for which we would be able to perform the exchange.
   *
   * @example "1.57912539"
   */
  maxTo: string;

  /**
   * Minimum exchangeable amount.
   *
   * @example "0.80000000"
   */
  min: string;

  /**
   * Minimum payin amount for which we would be able to perform the exchange.
   *
   * @example "0.80000000"
   */
  minFrom: string;

  /**
   * Minimum payout amount for which we would be able to perform the exchange.
   *
   * @example "0.00180472"
   */
  minTo: string;

  /**
   * Unix timestamp in seconds (10 digits) representing the expiration time of the fixed rate.
   *
   * @example 1726538857
   */
  expiredAt: number;

  /**
   * Exchange fee in pay-out currency.
   */
  fee?: string;
}>;

/**
 * @see https://docs.changelly.com/fix/get-fix-rate-for-amount#request
 *
 * @example
 * ```sh
 * curl -sL https://partners.mewapi.io/changelly-v2 -X POST -H Accept:application/json -H Content-Type:application/json --data '{"id":"1","jsonrpc":"2.0","method":"getFixRateForAmount","params":{"from":"sol","to":"btc","amountFrom":"1"}}' | jq '.' -C | less -R
 * # {
 * #   "jsonrpc": "2.0",
 * #   "result": [
 * #     {
 * #       "id": "GhNY6BJBOsjt8UlfEOHI&x0B$m6Dde",
 * #       "from": "sol",
 * #       "to": "btc",
 * #       "result": "0.002191229654",
 * #       "networkFee": "0.00001909",
 * #       "max": "700.00000000",
 * #       "maxFrom": "700.00000000",
 * #       "maxTo": "1.57946710",
 * #       "min": "0.80000000",
 * #       "minFrom": "0.80000000",
 * #       "minTo": "0.00180510",
 * #       "amountFrom": "1",
 * #       "amountTo": "0.00217213",
 * #       "expiredAt": 1726539734
 * #     }
 * #   ],
 * #   "id": "1"
 * # }
 * ```
 */
export type ChangellyApiGetFixRateForAmountParams = {
  /**
   * Payin currency code (in lowercase).
   *
   * @example "sol"
   */
  from: string;

  /**
   * Payout currency code (in lowercase).
   *
   * @example "btc"
   */
  to: string;

  /**
   * Amount that user is going to exchange.
   */
  amountFrom?: string;

  /**
   * Amount that user is going to receive.
   */
  amountTo?: string;

  /**
   * Escaped JSON.
   * You can use userMetadata to include any additional parameters for customization purposes.
   * To use this feature, please contact us at pro@changelly.com.
   */
  userMetadata?: string;
};

/**
 * @see https://docs.changelly.com/fix/get-fix-rate-for-amount#response
 */
export type ChangellyApiGetFixRateForAmountResult = Array<{
  /**
   * Rate ID that can be used during 1 minute.
   * This time should be enough for user to initiate the exchange.
   * Expired rate id cannot be used for creation of the fixed rate transaction.
   *
   * id has to be stored somewhere. It will be used as rateId value while calling.
   *
   * @example "FHzP%N~phM2h2&zCS$JilM)tEr!8oj"
   */
  id: string;

  /**
   * Exchange rate before withholding the network fee.
   *
   * Important. To calculate the exact amount that the user will get,
   * you need to multiply the amount that the user wants to send to
   * the result and deduct the value of the networkFee.
   *
   * @example "0.002191379964"
   */
  result: string;

  /**
   * Payin currency code.
   *
   * @example "sol"
   */
  from: string;

  /**
   * Payout currency code.
   *
   * @example "btc"
   */
  to: string;

  /**
   * Commission taken by the network from the amount sent to the user. Displayed in pay-out currency.
   *
   * @example "0.00001909"
   */
  networkFee: string;

  /**
   * Maximum exchangeable amount.
   *
   * @example "700.00000000"
   */
  max: string;

  /**
   * Maximum payin amount for which we would be able to perform the exchange.
   *
   * @example "700.00000000"
   */
  maxFrom: string;

  /**
   * Maximum payout amount for which we would be able to perform the exchange.
   *
   * @example "1.57946710"
   */
  maxTo: string;

  /**
   * Minimum exchangeable amount.
   *
   * @example "0.80000000"
   */
  min: string;

  /**
   * Minimum payin amount for which we would be able to perform the exchange.
   *
   * @example "0.80000000"
   */
  minFrom: string;

  /**
   * Minimum payout amount for which we would be able to perform the exchange.
   *
   * @example "0.00180510"
   */
  minTo: string;

  /**
   * Amount of assets that user will exchange after creating a fixed rate transaction.
   *
   * @example "1"
   */
  amountFrom: string;

  /**
   * Fixed exchange amount that user will receive after finishing a fixed-rate transaction using current rateId.
   *
   * @example "0.00217228"
   */
  amountTo: string;

  /**
   * Unix timestamp in seconds (10 digits) representing the expiration time of the fixed rate.
   *
   * @example 1726539789
   */
  expiredAt: number;

  /**
   * Exchange fee in pay-out currency.
   */
  fee?: string;
}>;

/**
 * @see https://docs.changelly.com/fix/create-fix-transaction#request
 *
 * @example
 * ```sh
 * # Replace "rateId" with "id" from "getFixRateForAmount"
 * curl -sL https://partners.mewapi.io/changelly-v2 -X POST -H Accept:application/json -H Content-Type:application/json --data '{"id":"1","jsonrpc":"2.0","method":"createFixTransaction","params":{"from":"sol","to":"btc","amountFrom":"1","rateId":"l3zsI9C(1TDc5dRYOsG%fjJdu6BEuN","address":"bc1puzz9tmxawd7zdd7klfgtywrgpma3u22fz5ecxhucd4j8tygqe5ms2vdd9y","amountFrom":"1","refundAddress":"CMGoYEKM8kSXwN9HzYiwRiZRXoMtEAQ98ZiPE9y67T38"}}' | jq '.' -C | less -R
 * # {
 * #   "jsonrpc": "2.0",
 * #   "result": {
 * #     "id": "ze6rnqcnnuxxd6hc",
 * #     "trackUrl": "https://changelly.com/track/ze6rnqcnnuxxd6hc",
 * #     "createdAt": 1726540614000000,
 * #     "type": "fixed",
 * #     "status": "new",
 * #     "payTill": "2024-09-17T02:51:54.173+00:00",
 * #     "currencyFrom": "sol",
 * #     "currencyTo": "btc",
 * #     "payinAddress": "CocKqBY2yF6hXDTaM5Y5WgMUHNNjagVzAxUEMfGwUHXm",
 * #     "amountExpectedFrom": "1",
 * #     "payoutAddress": "bc1puzz9tmxawd7zdd7klfgtywrgpma3u22fz5ecxhucd4j8tygqe5ms2vdd9y",
 * #     "refundAddress": "CMGoYEKM8kSXwN9HzYiwRiZRXoMtEAQ98ZiPE9y67T38",
 * #     "amountExpectedTo": "0.00219147",
 * #     "networkFee": "0.00001909"
 * #   },
 * #   "id": "1"
 * # }
 * ```
 */
export type ChangellyApiCreateFixedRateTransactionParams = {
  /**
   * Payin currency code (in lowercase).
   *
   * @example "btc"
   */
  from: string;

  /**
   * Payout currency code (in lowercase).
   *
   * @example "sol"
   */
  to: string;

  /**
   * Rate ID that you get from getFixRate/getFixRateForAmount requests.
   *
   * @see https://docs.changelly.com/fix/get-fix-rate
   * @see https://docs.changelly.com/fix/get-fix-rate-for-amount
   *
   * @example "FHzP%N~phM2h2&zCS$JilM)tEr!8oj"
   */
  rateId: string;

  /**
   * Recipient address.
   *
   * @example "CMGoYEKM8kSXwN9HzYiwRiZRXoMtEAQ98ZiPE9y67T38"
   */
  address: string;

  /**
   * Amount of currency that user is going to send.
   *
   * @example "1"
   */
  amountFrom?: string;

  /**
   * Amount user wants to receive.
   */
  amountTo?: string;

  /**
   * Additional ID for address for currencies that use additional ID for transaction processing.
   */
  extraId?: string;

  /**
   * Address of the wallet to refund in case of any technical issues during the exchange.
   * The currency of the wallet must match with the from currency.
   *
   * @example "CMGoYEKM8kSXwN9HzYiwRiZRXoMtEAQ98ZiPE9y67T38"
   */
  refundAddress: string;

  /**
   * extraId for refundAddress.
   */
  refundExtraId?: string;

  /**
   * Address of the wallet from which the user will send payin.
   */
  fromAddress?: string;

  /**
   * extraId for fromAddress.
   */
  fromExtraId?: string;

  /**
   * subaccountId from createSubaccount.
   *
   * @see https://docs.changelly.com/subaccounts/subaccount
   */
  subaccountId?: string;

  /**
   * Escaped JSON.
   * You can use userMetadata to include any additional parameters for customization purposes.
   * To use this feature, please contact us at pro@changelly.com.
   */
  userMetadata?: string;
};

/**
 * @see https://docs.changelly.com/fix/create-fix-transaction#response
 */
export type ChangellyApiCreateFixedRateTransactionResult = {
  /**
   * Not documented
   *
   * Contains a URL that you can visit to follow the transaction
   *
   * @example "https://changelly.com/track/ze6rnqcnnuxxd6hc"
   */
  trackUrl: string;

  /**
   * Transaction ID. Could be used in getStatus method.
   *
   * @see https://docs.changelly.com/info/get-status
   *
   * @example "ze6rnqcnnuxxd6hc"
   */
  id: string;

  /**
   * Type of transaction. Always fixed in this method.
   *
   * @example "fixed"
   */
  type: string;

  /**
   * Address for a user to send coins to.
   *
   * @example "CocKqBY2yF6hXDTaM5Y5WgMUHNNjagVzAxUEMfGwUHXm"
   */
  payinAddress: string;

  /**
   * Extra ID for payinAddress in case it is required.
   * Note: If the payinExtraId parameter is returned in the response and is not null,
   * it is required for user to send the funds to the payinAddress specifying extraId.
   * Otherwise, the transactions will not be processed and the user will need to get a
   * refund through technical support.
   */
  payinExtraId?: string;

  /**
   * Address where the exchange result will be sent to.
   *
   * @example "bc1puzz9tmxawd7zdd7klfgtywrgpma3u22fz5ecxhucd4j8tygqe5ms2vdd9y"
   */
  payoutAddress: string;

  /**
   * Extra ID for payoutAddress in case it is required.
   */
  payoutExtraId?: string;

  /**
   * Address of the wallet to refund in case of any technical issues during the exchange.
   * The currency of the wallet must match with the from currency.
   *
   * @example "CMGoYEKM8kSXwN9HzYiwRiZRXoMtEAQ98ZiPE9y67T38"
   */
  refundAddress: string;

  /**
   * Extra ID for refundAddress.
   */
  refundExtraId?: string;

  /**
   * The amountFrom value from createFixTransaction request.
   *
   * @example "1"
   */
  amountExpectedFrom: number;

  /**
   * The amountTo value from getFixRateForAmount response.
   * This is the estimated payout amount of currency before withholding the network fee.
   *
   * @see https://docs.changelly.com/fix/get-fix-rate-for-amount
   *
   * @example "0.00219147"
   */
  amountExpectedTo: string;

  /**
   * Transaction status.
   * Will always be new when transaction is created.
   * If you reference the same transaction using the getStatus or getTransactions method,
   * you'll get the waiting status as an equivalent to new.
   *
   * @example "new"
   */
  status: string;

  /**
   * Indicates time until which user needs to make the payment.
   *
   * @example "2024-09-17T02:51:54.173+00:00"
   */
  payTill: string;

  /**
   * Payout currency code.
   *
   * @example "btc"
   */
  currencyTo: string;

  /**
   * Payin currency code.
   *
   * @example "sol"
   */
  currencyFrom: string;

  /**
   * Time in timestamp format (microseconds) when the transaction was created.
   *
   * @example 1726540614000000
   */
  createdAt: number;

  /**
   * Commission taken by the network from the amount sent to the user. Displayed in payout currency.
   *
   * @example "0.00001909"
   */
  networkFee: string;
};

/**
 * @see https://docs.changelly.com/info/get-status#request
 *
 * @example
 * ```sh
 * # Replace "id" with "id" from "createFixTransaction"
 * curl -sL https://partners.mewapi.io/changelly-v2 -X POST -H Accept:application/json -H Content-Type:application/json --data '{"id":"1","jsonrpc":"2.0","method":"getStatus","params":{"id":"ze6rnqcnnuxxd6hc"}}' | jq '.' -C | less -R
 * # {
 * #   "jsonrpc": "2.0",
 * #   "result": "waiting",
 * #   "id": "1"
 * # }
 * ```
 */

export type ChangellyApiGetStatusParams = {
  /**
   * Transaction ID.
   *
   * @example "ze6rnqcnnuxxd6hc"
   */
  id: string;
};

/**
 * @see https://docs.changelly.com/info/get-status#response
 *
 * Transaction status.
 *
 * @example "waiting"
 */
export type ChangellyApiGetStatusResult = string;
