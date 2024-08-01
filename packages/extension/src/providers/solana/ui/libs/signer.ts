import { InternalOnMessageResponse } from "@/types/messenger";
import { SignerTransactionOptions, SignerMessageOptions } from "../types";

import { Psbt } from "bitcoinjs-lib";
const TransactionSigner = (
  options: SignerTransactionOptions
): Promise<Psbt> => {
  throw new Error("btc-tx-signer not implemented");
};

const MessageSigner = (
  options: SignerMessageOptions
): Promise<InternalOnMessageResponse> => {
  throw new Error("btc-msg-signer not implemented");
};

export { TransactionSigner, MessageSigner };
