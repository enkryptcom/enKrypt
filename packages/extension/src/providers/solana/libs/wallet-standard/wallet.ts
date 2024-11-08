import {
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionFeature,
  type SolanaSignAndSendTransactionMethod,
  type SolanaSignAndSendTransactionOutput,
  SolanaSignIn,
  type SolanaSignInFeature,
  type SolanaSignInMethod,
  type SolanaSignInOutput,
  SolanaSignMessage,
  type SolanaSignMessageFeature,
  type SolanaSignMessageMethod,
  type SolanaSignMessageOutput,
  SolanaSignTransaction,
  type SolanaSignTransactionFeature,
  type SolanaSignTransactionMethod,
  type SolanaSignTransactionOutput,
} from '@solana/wallet-standard-features';
import type { Wallet } from '@wallet-standard/base';
import {
  StandardConnect,
  type StandardConnectFeature,
  type StandardConnectMethod,
  StandardDisconnect,
  type StandardDisconnectFeature,
  type StandardDisconnectMethod,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
  type StandardEventsOnMethod,
} from '@wallet-standard/features';
import { EnkryptWalletAccount } from './account.js';
import { icon } from './icon.js';
import { isSolanaChain, SOLANA_CHAINS } from './solana.js';
import type { Enkrypt } from './window.js';
import { EmitEvent } from '@/providers/ethereum/types/index.js';

export const EnkryptNamespace = 'enkrypt:';

export type EnkryptFeature = {
  [EnkryptNamespace]: {
    enkrypt: Enkrypt;
  };
};
const hexToUint8Array = (hexString: string) => {
  hexString = hexString.replace('0x', '');
  return Uint8Array.from(
    hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)),
  );
};
const uint8ArrayToHex = (buffer: Uint8Array) => {
  const str = Array.prototype.map
    .call(buffer, x => ('00' + x.toString(16)).slice(-2))
    .join('');
  return `0x${str}`;
};

export class EnkryptWallet implements Wallet {
  readonly #listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][];
  } = {};
  readonly #version = '1.0.0' as const;
  readonly #name = 'Enkrypt' as const;
  readonly #icon = icon;
  #accounts: EnkryptWalletAccount[] | null = null;
  readonly #enkrypt: Enkrypt;

  get version() {
    return this.#version;
  }

  get name() {
    return this.#name;
  }

  get icon() {
    return this.#icon;
  }

  get chains() {
    return SOLANA_CHAINS.slice();
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignMessageFeature &
    SolanaSignInFeature &
    EnkryptFeature {
    return {
      [StandardConnect]: {
        version: '1.0.0',
        connect: this.#connect,
      },
      [StandardDisconnect]: {
        version: '1.0.0',
        disconnect: this.#disconnect,
      },
      [StandardEvents]: {
        version: '1.0.0',
        on: this.#on,
      },
      [SolanaSignAndSendTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signAndSendTransaction: this.#signAndSendTransaction,
      },
      [SolanaSignTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signTransaction: this.#signTransaction,
      },
      [SolanaSignMessage]: {
        version: '1.0.0',
        signMessage: this.#signMessage,
      },
      [SolanaSignIn]: {
        version: '1.0.0',
        signIn: this.#signIn,
      },
      [EnkryptNamespace]: {
        enkrypt: this.#enkrypt,
      },
    };
  }
  get accounts() {
    return this.#accounts && this.#accounts.length ? this.#accounts : [];
  }

  constructor(enkrypt: Enkrypt) {
    if (new.target === EnkryptWallet) {
      Object.freeze(this);
    }
    this.#enkrypt = enkrypt;
    enkrypt.on(EmitEvent.connect, this.#connected, this);
    enkrypt.on(EmitEvent.disconnect, this.#disconnected, this);
    enkrypt.on(EmitEvent.accountsChanged, this.#reconnected, this);
    this.#connected();
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    this.#listeners[event]?.push(listener) ||
      (this.#listeners[event] = [listener]);
    return (): void => this.#off(event, listener);
  };

  #emit<E extends StandardEventsNames>(
    event: E,
    ...args: Parameters<StandardEventsListeners[E]>
  ): void {
    // eslint-disable-next-line prefer-spread
    this.#listeners[event]?.forEach(listener => listener.apply(null, args));
  }

  #off<E extends StandardEventsNames>(
    event: E,
    listener: StandardEventsListeners[E],
  ): void {
    this.#listeners[event] = this.#listeners[event]?.filter(
      existingListener => listener !== existingListener,
    );
  }

  #connected = () => {
    if (this.#enkrypt.accounts.length) {
      this.#accounts = this.#enkrypt.accounts.map(acc => {
        return new EnkryptWalletAccount({
          address: acc.address,
          publicKey: hexToUint8Array(acc.pubkey),
        });
      });
      this.#emit('change', { accounts: this.accounts });
    }
  };

  #disconnected = () => {
    if (this.#accounts?.length) {
      this.#accounts = null;
      this.#emit('change', { accounts: this.accounts });
    }
  };

  #reconnected = () => {
    if (this.#enkrypt.accounts.length) {
      this.#connected();
    } else {
      this.#disconnected();
    }
  };

  #connect: StandardConnectMethod = async ({ silent } = {}) => {
    if (!this.#accounts?.length) {
      await this.#enkrypt.connect(silent ? { onlyIfTrusted: true } : undefined);
    }
    this.#connected();
    return { accounts: this.accounts };
  };

  #disconnect: StandardDisconnectMethod = async () => {
    await this.#enkrypt.disconnect();
  };

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (
    ...inputs
  ) => {
    if (!this.#accounts?.length) throw new Error('not connected');
    const outputs: SolanaSignAndSendTransactionOutput[] = [];
    for (const input of inputs) {
      const { transaction, account, chain, options } = input;
      const validAccount = this.#accounts.find(
        acc => acc.address === account.address,
      );
      if (!validAccount) throw new Error('invalid account');
      if (!isSolanaChain(chain)) throw new Error('invalid chain');
      const signature = await this.#enkrypt.signAndSendTransaction(
        {
          address: account.address,
          hex: uint8ArrayToHex(transaction),
          chain: chain,
        },
        options || {},
      );
      outputs.push({ signature: hexToUint8Array(signature) });
    }
    return outputs;
  };

  #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
    if (!this.#accounts?.length) throw new Error('not connected');
    const outputs: SolanaSignTransactionOutput[] = [];
    for (const input of inputs) {
      const { transaction, account, chain } = input;
      const validAccount = this.#accounts.find(
        acc => acc.address === account.address,
      );
      if (!validAccount) throw new Error('invalid account');
      if (chain && !isSolanaChain(chain)) throw new Error('invalid chain');

      const signedTransaction = await this.#enkrypt.signTransaction({
        address: account.address,
        hex: uint8ArrayToHex(transaction),
        chain: chain,
      });
      outputs.push({ signedTransaction: hexToUint8Array(signedTransaction) });
    }
    return outputs;
  };

  #signMessage: SolanaSignMessageMethod = async (...inputs) => {
    if (!this.#accounts?.length) throw new Error('not connected');
    const outputs: SolanaSignMessageOutput[] = [];

    if (inputs.length === 1) {
      const { message, account } = inputs[0]!;
      let isValidAccount = false;
      for (const acc of this.#accounts) {
        if (acc.address === account.address) {
          isValidAccount = true;
          break;
        }
      }
      if (!isValidAccount) throw new Error('invalid account');
      const { signature, signedMessage } = await this.#enkrypt.signMessage({
        address: account.address,
        message: uint8ArrayToHex(message),
      });
      outputs.push({
        signedMessage: hexToUint8Array(signedMessage),
        signature: hexToUint8Array(signature),
      });
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(...(await this.#signMessage(input)));
      }
    }
    return outputs;
  };

  #signIn: SolanaSignInMethod = async (...inputs) => {
    const outputs: SolanaSignInOutput[] = [];
    for (const input of inputs) {
      const res = await this.#enkrypt.signIn(input);
      const output = {
        account: new EnkryptWalletAccount({
          address: res.address,
          publicKey: hexToUint8Array(res.pubkey),
        }),
        signature: hexToUint8Array(res.signature),
        signedMessage: hexToUint8Array(res.signedMessage),
        signatureType: res.signatureType,
      };
      outputs.push(output);
    }
    this.#connected();
    return outputs;
  };
}
