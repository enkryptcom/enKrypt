import type { SendMessageHandler } from "@/types/provider";
import type Accounts from "../libs/accounts";
import type Metadata from "../libs/metadata";
import type Provider from "../libs/provider";
import type Signer from "../libs/signer";
import type { RPCRequestType } from "@enkryptcom/types";
import type { Injected } from "@polkadot/extension-inject/types";
import type { Provider as InjectedProvider } from "../inject";

export interface SubstrateInjectOptions {
  dappName: string;
  sendMessageHandler: SendMessageHandler;
  id: number;
}

export abstract class SubstrateInjectedProvider implements Injected {
  abstract accounts: Accounts;
  abstract metadata: Metadata;
  abstract provider: Provider;
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

export { InjectedProvider };
