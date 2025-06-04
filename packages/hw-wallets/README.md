# @enkryptcom/hw-wallets

## v0.0.5

## Hardware wallet manager for enkrypt

### Getting started

#### Minimum Node version

`node v20`

#### Installation

NPM: `npm install @enkryptcom/hw-wallets @enkryptcom/types`  
Yarn: `yarn add @enkryptcom/hw-wallets @enkryptcom/types`  
PNPM `pnpm add @enkryptcom/hw-wallets @enkryptcom/types`

### How to use

1. Create an instance of `HWwalletManager`

```
import HWwalletManager from @enkryptcom/hw-wallets

const hwManager = new HWwalletManager()
```

2. Call methods within class, passing network names and providers. Class automatically handles which wallet to use.

### API

#### `getAddress(options: getAddressRequest): Promise<AddressResponse>`

Returns wallet address based off of the path provided in the `getAddressRequest`.

#### `signPersonalMessage(options: SignMessageRequest): Promise<string>`

Signs personal message.

#### `signTransaction(options: SignTransactionRequest): Promise<string>`

Signs transaction.

#### `getSupportedPaths(options: isConnectedRequest): Promise<PathType[]>`

Returns supported paths based on options provided.

#### `isNetworkSupported(networkName: NetworkNames): boolean`

Checks network name support.

#### `isConnected(options: isConnectedRequest): Promise<boolean>`

Checks connection status.

#### `close(): Promise<void>`

Closes all HW wallet connections

### Types

`NetworkNames`: https://github.com/enkryptcom/enKrypt/blob/main/packages/types/src/networks.ts#L1  
`getAddressRequest`: https://github.com/enkryptcom/enKrypt/blob/main/packages/hw-wallets/src/types.ts#L74  
`AddressResponse`: https://github.com/enkryptcom/enKrypt/blob/main/packages/hw-wallets/src/types.ts#L31  
`SignMessageRequest`: https://github.com/enkryptcom/enKrypt/blob/main/packages/hw-wallets/src/types.ts#L54  
`SignTransactionRequest`: https://github.com/enkryptcom/enKrypt/blob/main/packages/hw-wallets/src/types.ts#L65  
`isConnectedRequest`: https://github.com/enkryptcom/enKrypt/blob/main/packages/hw-wallets/src/types.ts#L78

### Notes

Connection request to hardware wallet actually happens on `getAddress()` request.
