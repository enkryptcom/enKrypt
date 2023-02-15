# SKALE chains folder

Folder with all SKALE chains supported by enKrypt


## Add new SKALE chain
### Add Network to Network Types

Navigate to `packages/types/src/networks.ts`.

Add `SkaleNewName = "skaleNEWNAME",` at the end of enum `NetworkNames`


### Add SKALE chain params file

Navigate to `packages/extension/src/providers/ethereum/networks/skale` and create a file with the name [newName].ts

Please use this template to create your skale chain file:

```
import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleNewName,                          // change to your SKALE chain NetworkName
  name_long: "SKALE | NewName",                             // change to your SKALE chain public name like "SKALE | YOUR_NAME" or "SKALE Testnet | YOUR_NAME"
  chainName: "new-name-chain",                              // change to your SKALE chain actual name in the network
  chainID: "0x11111111",                                    // change to your SKALE chain chainID
  isTestNetwork: true,                                      // optional param (default: false)
  icon: "newNameChain.png"                                  // optional param - icon of your chain placed in `networks/icons` (default: "skl.png")
};

export const assets: ICustomSKALEAsset[] = [                // optional param - array of preconfigured tokens (ETHC - is predeployed token)
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
  {
    name: "Your Token",                                     // optional param - name of your token (default: imported from coingecko )
    symbol: "YST",                                          // optional param - symbol of your token (default: imported from coingecko ) 
    address: "0x7777777777777777777777777777777777777777",  // address of your token on SKALE chain
    coingeckoID: "ethereum",                                // coingecko platform ID of your token
    showZero: true,                                         // optional param - show token balance if balance is zero (default: false )
    icon: "yourToken.png",                                  // optional param - icon of token placed in `networks/icons` (default: imported from coingecko or "skl.png" )
    decimals: 6,                                            // optional param - decimals of token (default: 18 )
  },
];

export default createSkaleEvmNetwork(skaleOptions, assets); // "assets" optional param - if you want to add preconfigured tokens - include assets

```


### Add SKALE chain to export in skale folder

Navigate to `packages/extension/src/providers/ethereum/networks/skale/index.ts`

1. Add `import { newNameNode } from "./newName";` at the end of imports at the top
2. Add `newNameNode,` at the end of exports object


### Add SKALE chain to export in networks folder

Navigate to `packages/extension/src/providers/ethereum/networks/index.ts`

Add `skaleNewName: skale.newNameNode,` at the end of exports object


### Add SKALE chain to etherscan activity handler

Navigate to `packages/extension/src/providers/ethereum/libs/activity-handler/providers/etherscan/configs.ts`
Add your SKALE chain support to the end of `NetworkEndpoints`:
```
[NetworkNames.SkaleNewName]:
    "https://new-name-chain.explorer.mainnet.skalenodes.com/",  // change `mainnet` to `staging-v3` if chain is test network
```


### Test on your local

1. Run in root folder
```
yarn --frozen-lockfile
yarn build:all
yarn watch-extension
```
2. Add Extension in Chrome(or other browser)

Extension path: `packages/extension/dist`
