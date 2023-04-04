import Web3Eth from "web3-eth";
import { toBN } from "web3-utils";
import Erc20abi from "./abi/erc20";
import { BN, EVMTransaction, TokenType, TransactionType } from "../types";
import { GAS_LIMITS } from "../configs";

export const TOKEN_AMOUNT_INFINITY_AND_BEYOND =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const getAllowance = (options: {
  owner: string;
  contract: string;
  spender: string;
  web3eth: Web3Eth;
}): Promise<string> => {
  const contract = new options.web3eth.Contract(
    Erc20abi as any,
    options.contract
  );
  return contract.methods.allowance(options.owner, options.spender).call();
};

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

const getAllowanceTransactions = async (options: {
  fromToken: TokenType;
  fromAddress: string;
  spender: string;
  web3eth: Web3Eth;
  amount: BN;
  infinityApproval: boolean;
}): Promise<EVMTransaction[]> => {
  const transactions: EVMTransaction[] = [];

  const approvedAmount = toBN(
    await getAllowance({
      contract: options.fromToken.address,
      owner: options.fromAddress,
      spender: options.spender,
      web3eth: options.web3eth,
    })
  );
  if (approvedAmount.lt(options.amount)) {
    if (approvedAmount.eqn(0)) {
      transactions.push(
        getApproval({
          from: options.fromAddress,
          spender: options.spender,
          value: options.infinityApproval
            ? TOKEN_AMOUNT_INFINITY_AND_BEYOND
            : options.amount.toString(),
          contract: options.fromToken.address,
        })
      );
    } else {
      transactions.push(
        getApproval({
          from: options.fromAddress,
          spender: options.spender,
          value: "0",
          contract: options.fromToken.address,
        })
      );
      transactions.push(
        getApproval({
          from: options.fromAddress,
          spender: options.spender,
          value: options.infinityApproval
            ? TOKEN_AMOUNT_INFINITY_AND_BEYOND
            : options.amount.toString(),
          contract: options.fromToken.address,
        })
      );
    }
  }
  return transactions;
};
export { getAllowance, getApproval, getAllowanceTransactions, getTransfer };
