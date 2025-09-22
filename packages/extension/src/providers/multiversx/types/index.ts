import { NetworkNames } from '@enkryptcom/types';
import type { Provider as InjectedProvider } from '../inject';

export const MultiversXNetworks = {
  MVX: NetworkNames.MultiversX,
};

export interface ProviderMessage {
  method: MessageMethod;
  params: Array<any>;
}

export enum MessageMethod {
  changeAddress = 'changeAddress',
}

export enum EmitEvent {
  accountsChanged = 'accountsChanged',
}

export { InjectedProvider };
