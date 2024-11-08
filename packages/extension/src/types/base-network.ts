import EvmAPI from '@/providers/ethereum/libs/api';
import SubstrateAPI from '@/providers/polkadot/libs/api';
import BitcoinAPI from '@/providers/bitcoin/libs/api';
import KadenaAPI from '@/providers/kadena/libs/api';
import SolanaAPI from '@/providers/solana/libs/api';
import { AssetsType, ProviderName } from '@/types/provider';
import { CoingeckoPlatform, SignerType, NetworkNames } from '@enkryptcom/types';
import { Activity } from './activity';
import { BaseToken } from './base-token';
import { BNType } from '@/providers/common/types';

export interface SubNetworkOptions {
  id: string;
  name: string;
}
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
  node: string;
  displayAddress: (address: string, chainId?: BNType) => string;
  provider: ProviderName;
  coingeckoID?: string;
  coingeckoPlatform?: CoingeckoPlatform;
  identicon: (address: string) => string;
  basePath: string;
  subNetworks?: SubNetworkOptions[];
  api: () =>
    | Promise<SubstrateAPI>
    | Promise<EvmAPI>
    | Promise<BitcoinAPI>
    | Promise<KadenaAPI>
    | Promise<SolanaAPI>;
  customTokens?: boolean;
}

/**
 * The main representation of a network in the Enkrypt extension.
 *
 * Instantiated from a mostly static network config.
 *
 * Provides some common properties of networks used throughout UI elements and functionality in the app.
 *
 * Intended to be subclassed by different network types; for example EVMNetwork, SolanaNetwork, PolkadotNetwork etc.
 *
 * Has an `api` function (property) which returns a `ProviderAPIInterface` with some basic methods to interract with the network
 * for balances, transaction statuses, etc. The implementing class of `ProviderAPIInterface` is typically one-to-one with the
 * the network type. For example EVM networks have their own API (which wraps node JSON RPC). Solana networks have a different API.
 */
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
  public node: string;
  public displayAddress: (address: string, chainId?: BNType) => string;
  public provider: ProviderName;
  public coingeckoID: string | undefined;
  public coingeckoPlatform: CoingeckoPlatform | undefined;
  public identicon: (address: string) => string;
  public basePath: string;
  public decimals: number;
  public subNetworks?: SubNetworkOptions[];
  public api: () =>
    | Promise<SubstrateAPI>
    | Promise<EvmAPI>
    | Promise<BitcoinAPI>
    | Promise<KadenaAPI>
    | Promise<SolanaAPI>;
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
    this.subNetworks = options.subNetworks;
  }

  public abstract getAllTokens(address: string): Promise<BaseToken[]>;
  public abstract getAllTokenInfo(address: string): Promise<AssetsType[]>;
  public abstract getAllActivity(address: string): Promise<Activity[]>;
}
