import { BaseNetwork } from "@/types/base-network";
import { AssetsType, ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import createIcon from "../libs/blockies";

export interface EvmNetworkOptions {
  name: NetworkNames;
  name_long: string;
  homePage: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  chainID: number;
  isTestNetwork: boolean;
  currencyName: string;
  node: string;
  icon: string;
  gradient: string;
  coingeckoID?: string;
  assetsHandler?: (
    network: BaseNetwork,
    address: string
  ) => Promise<AssetsType[]>;
}

export class EvmNetwork extends BaseNetwork {
  public chainID: number;

  private assetsHandler:
    | ((network: BaseNetwork, address: string) => Promise<AssetsType[]>)
    | undefined;

  constructor(options: EvmNetworkOptions) {
    const api = async () => {
      const api = new API(options.node);
      await api.init();
      return api;
    };

    const baseOptions = {
      signer: [SignerType.secp256k1],
      provider: ProviderName.ethereum,
      displayAddress: (address: string) => toChecksumAddress(address),
      identicon: createIcon,
      basePath: "m/44'/60'/0'/0",
      decimals: 18,
      api,
      ...options,
    };

    super(baseOptions);

    this.chainID = options.chainID;
    this.assetsHandler = options.assetsHandler;
  }

  public async getAllTokenInfo(address: string): Promise<AssetsType[]> {
    if (this.assetsHandler) {
      return this.assetsHandler(this, address);
    } else {
      const api = await this.api();
      const balance = await (api as API).getBalance(address);
      const nativeAsset: AssetsType = {
        name: this.name_long,
        symbol: this.name,
        icon: this.icon,
        balance,
        balancef: balance.toString(),
        balanceUSD: 0,
        balanceUSDf: "0",
        value: "0",
        valuef: "0",
        decimals: this.decimals,
        sparkline: "",
        priceChangePercentage: 0,
      };

      return [nativeAsset];
    }
  }
}
