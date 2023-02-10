import EvmAPI from "@/providers/ethereum/libs/api";
import SubstrateAPI from "@/providers/polkadot/libs/api";
import BitcoinAPI from "@/providers/bitcoin/libs/api";
import { AssetsType, ProviderName } from "@/types/provider";
import { CoingeckoPlatform, SignerType, NetworkNames } from "@enkryptcom/types";
import { Activity } from "./activity";
import { BaseToken } from "./base-token";
import { BNLike } from "ethereumjs-util";

export interface BaseNetworkOptions {
  name: NetworkNames;
  name_long: string;
  homePage: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  isTestNetwork: boolean;
  currencyName: string;
  currencyNameLong: string;
  icon: string;
  decimals: number;
  signer: SignerType[];
  gradient: string;
  node: string;
  displayAddress: (address: string, chainId?: BNLike) => string;
  provider: ProviderName;
  coingeckoID?: string;
  coingeckoPlatform?: CoingeckoPlatform;
  identicon: (address: string) => string;
  basePath: string;
  api: () => Promise<SubstrateAPI> | Promise<EvmAPI> | Promise<BitcoinAPI>;
  customTokens?: boolean;
}

export abstract class BaseNetwork {
  public name: NetworkNames;
  public name_long: string;
  public homePage: string;
  public blockExplorerTX: string;
  public blockExplorerAddr: string;
  public isTestNetwork: boolean;
  public currencyName: string;
  public currencyNameLong: string;
  public icon: string;
  public signer: SignerType[];
  public gradient: string;
  public node: string;
  public displayAddress: (address: string, chainId?: BNLike) => string;
  public provider: ProviderName;
  public coingeckoID: string | undefined;
  public coingeckoPlatform: CoingeckoPlatform | undefined;
  public identicon: (address: string) => string;
  public basePath: string;
  public decimals: number;
  public api: () =>
    | Promise<SubstrateAPI>
    | Promise<EvmAPI>
    | Promise<BitcoinAPI>;
  public customTokens: boolean;

  constructor(options: BaseNetworkOptions) {
    this.name = options.name;
    this.name_long = options.name_long;
    this.homePage = options.homePage;
    this.blockExplorerTX = options.blockExplorerTX;
    this.blockExplorerAddr = options.blockExplorerAddr;
    this.isTestNetwork = options.isTestNetwork;
    this.currencyName = options.currencyName;
    this.icon = options.icon;
    this.signer = options.signer;
    this.gradient = options.gradient;
    this.node = options.node;
    this.displayAddress = options.displayAddress;
    this.provider = options.provider;
    this.coingeckoID = options.coingeckoID;
    this.identicon = options.identicon;
    this.basePath = options.basePath;
    this.decimals = options.decimals;
    this.api = options.api;
    this.customTokens = options.customTokens ?? false;
    this.coingeckoPlatform = options.coingeckoPlatform;
    this.currencyNameLong = options.currencyNameLong;
  }

  public abstract getAllTokens(address: string): Promise<BaseToken[]>;
  public abstract getAllTokenInfo(address: string): Promise<AssetsType[]>;
  public abstract getAllActivity(address: string): Promise<Activity[]>;
}
