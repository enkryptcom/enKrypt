import Web3Eth from "web3-eth";
import { toBN } from "web3-utils";
import Erc20abi from "./abi/erc20";
import { BN, EVMTransaction, TokenType, TransactionType } from "../types";
import { GAS_LIMITS } from "../configs";

export const TOKEN_AMOUNT_INFINITY_AND_BEYOND =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

/**
 * Query the ERC20 `contract` how much `spender` can spend on behalf of `owner`
 */
const getAllowance = (options: {
  owner: string;
  contract: string;
  spender: string;
  web3eth: Web3Eth;
}): Promise<string> => {
  const contract = new options.web3eth.Contract(
    Erc20abi as any,
    options.contract,
  );
  return contract.methods.allowance(options.owner, options.spender).call();
};

/**
 * Prepare a transaction of `value` amount of ERC20 `contract` from `from` to `to`
 */
const getTransfer = (options: {
  from: string;
  contract: string;
  to: string;
  value: string;
}): EVMTransaction => {
  const web3Eth = new Web3Eth();
  const contract = new web3Eth.Contract(Erc20abi as any);
  return {
    from: options.from,
    data: contract.methods.transfer(options.to, options.value).encodeABI(),
    gasLimit: GAS_LIMITS.transferToken,
    to: options.contract,
    value: "0x0",
    type: TransactionType.evm,
  };
};

/**
 * Prepare a transaction to approve `spender` to spend `value` amount of an
 * ERC20 `contract` token on behalf of `from`
 */
const getApproval = (options: {
  from: string;
  contract: string;
  spender: string;
  value: string;
}): EVMTransaction => {
  const web3Eth = new Web3Eth();
  const contract = new web3Eth.Contract(Erc20abi as any);
  return {
    from: options.from,
    data: contract.methods.approve(options.spender, options.value).encodeABI(),
    gasLimit: GAS_LIMITS.approval,
    to: options.contract,
    value: "0x0",
    type: TransactionType.evm,
  };
};

/**
 * Prepare transactions to approval of `spender` to spend `fromToken`
 * on behalf of `fromAddress`
 */
const getAllowanceTransactions = async (options: {
  fromToken: TokenType;
  fromAddress: string;
  spender: string;
  web3eth: Web3Eth;
  amount: BN;
  infinityApproval: boolean;
}): Promise<EVMTransaction[]> => {
  const transactions: EVMTransaction[] = [];

  /** Amount that `spender` can spend of `fromToken` on behalf of `fromAddress` */
  const approvedAmount = toBN(
    await getAllowance({
      contract: options.fromToken.address,
      owner: options.fromAddress,
      spender: options.spender,
      web3eth: options.web3eth,
    }),
  );
  if (approvedAmount.lt(options.amount)) {
    // `spender` isn't approved for enough
    if (approvedAmount.eqn(0)) {
      // `spender` isn't approved at all
      transactions.push(
        getApproval({
          from: options.fromAddress,
          spender: options.spender,
          value: options.infinityApproval
            ? TOKEN_AMOUNT_INFINITY_AND_BEYOND
            : options.amount.toString(),
          contract: options.fromToken.address,
        }),
      );
    } else {
      // `spender` is approved for some, but not enough

      // Reset approval of `spender`
      transactions.push(
        getApproval({
          from: options.fromAddress,
          spender: options.spender,
          value: "0",
          contract: options.fromToken.address,
        }),
      );
      // Request approval for `spender`
      transactions.push(
        getApproval({
          from: options.fromAddress,
          spender: options.spender,
          value: options.infinityApproval
            ? TOKEN_AMOUNT_INFINITY_AND_BEYOND
            : options.amount.toString(),
          contract: options.fromToken.address,
        }),
      );
    }
  }
  return transactions;
};
export { getAllowance, getApproval, getAllowanceTransactions, getTransfer };
