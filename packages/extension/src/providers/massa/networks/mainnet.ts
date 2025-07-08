import { NetworkNames } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import MassaAPI from '../libs/api';
import { SignerType } from '@enkryptcom/types';
import { ProviderName } from '@/types/provider';
import createIcon from '../libs/blockies';
import { CHAIN_ID, PublicApiUrl } from '@massalabs/massa-web3';
import { MassaNetworkOptions } from '../types';
import { ActivityStatus, ActivityType } from '@/types/activity';
import { OperationStatus, Operation } from '@massalabs/massa-web3';
import icon from './icons/Massa_logo.webp';


const mainnetOptions: MassaNetworkOptions = {
  name: NetworkNames.Massa,
  name_long: 'Massa',
  homePage: 'https://massa.net/',
  blockExplorerTX: 'https://explorer.massa.net/operation/[[txHash]]',
  blockExplorerAddr: 'https://explorer.massa.net/address/[[address]]',
  isTestNetwork: false,
  currencyName: 'MAS',
  currencyNameLong: 'Massa',
  node: PublicApiUrl.Mainnet,
  icon,
  decimals: 9,
  signer: [SignerType.ed25519mas],
  displayAddress: (address: string) => address,
  provider: ProviderName.massa,
  identicon: createIcon,
  basePath: "m/44'/632'",
  coingeckoID: 'massa',
  chainId: CHAIN_ID.Mainnet,
  api: async () => {
    const api = new MassaAPI(PublicApiUrl.Mainnet);
    await api.init();
    return api;
  },
};

class MassaNetwork extends BaseNetwork {
  private selectedAddress: string = '';

  constructor(options: MassaNetworkOptions) {
    super(options);
  }

  setSelectedAddress(address: string) {
    this.selectedAddress = address;
  }

  async getAllTokens(): Promise<any[]> {
    return [];
  }

  async getAllTokenInfo(): Promise<any[]> {
    return [];
  }

  async getAllActivity(): Promise<any[]> {
    try {
      const api = await this.api() as MassaAPI;
      const operations = await api.getOperationsByAddress(this.selectedAddress);
      // return operations.map((op: Operation) => ({
      //   nonce: op.id,
      //   from: op.sender_address,
      //   to: op.recipient_address,
      //   isIncoming: op.recipient_address === this.selectedAddress,
      //   network: this.name,
      //   rawInfo: op,
      //   status: op.status === OperationStatus.Success || op.status === OperationStatus.SpeculativeSuccess
      //     ? ActivityStatus.success
      //     : ActivityStatus.failed,
      //   timestamp: op.slot * 16000, // Approximate timestamp based on slot
      //   value: op.amount ? op.amount.toString() : '0',
      //   transactionHash: op.id,
      //   type: ActivityType.transaction,
      //   token: {
      //     decimals: this.decimals,
      //     icon: this.icon,
      //     name: this.currencyNameLong,
      //     symbol: this.currencyName,
      //     price: '0', // TODO: Implement price fetching
      //   },
      // }));
      return [];
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  }
}

const mainnet = new MassaNetwork(mainnetOptions);

export default mainnet; 