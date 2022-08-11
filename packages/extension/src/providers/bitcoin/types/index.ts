import type { SendMessageHandler, NodeType } from "@/types/provider";
import type Accounts from "../libs/accounts";
import type Signer from "../libs/signer";
import type { RPCRequestType } from "@enkryptcom/types";
import type { Provider as InjectedProvider } from "../inject";
import { SignerType } from "@enkryptcom/types";

export interface SubstrateInjectOptions {
  dappName: string;
  sendMessageHandler: SendMessageHandler;
  id: number;
}

export abstract class BitcoinInjectedProvider {
  abstract accounts: Accounts;
  abstract signer: Signer;
  abstract dappName: string;
  abstract id: number;
  abstract sendMessageHandler: InjectedSendMessageHandler;
  abstract handleMessage(request: RPCRequestType): void;
}

export interface RouterOnMessage extends RPCRequestType {
  id: number;
}

export type InjectedSendMessageHandler = (
  id: number,
  message: RPCRequestType
) => Promise<any>;

export interface InjectLibOptions {
  dappName: string;
  sendMessageHandler: InjectedSendMessageHandler;
  id: number;
}

export type BitcoinSignerTypes = SignerType.secp256k1btc;

export interface PolkadotNodeType extends NodeType {
  signer: BitcoinSignerTypes[];
  decimals: number;
}

export interface PolkadotAPIOptions {
  name: string;
  decimals: number;
}

export interface BitcoinNetworkInfo {
  messagePrefix: string;
  bech32: string;
  bip32: {
    public: number;
    private: number;
  };
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
  dustThreshold: null;
}

export interface HaskoinBalanceType {
  address: string;
  confirmed: number;
  unconfirmed: number;
  utxo: number;
  txs: number;
  received: number;
}
export interface HaskoinUnspentType {
  address: string;
  block: {
    height: number;
    position: number;
  };
  txid: string;
  index: number;
  pkscript: string;
  value: number;
}
export { InjectedProvider };
