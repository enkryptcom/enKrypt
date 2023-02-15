import { ethers, Contract, utils, constants } from "ethers";
import { BaseResolver, CoinType } from "../types";
import { getTLD } from "../utils";


const ROOTSTOCK_RPC_NODE = "https://public-node.rsk.co";

// REF: https://developers.rsk.co/rif/rns/architecture/registry/
const RNS_REGISTRY_ADDRESS = "0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5";

const stripHexPrefix = (hex: string): string => hex.slice(2);

const RNS_REGISTRY_ABI = [
  "function resolver(bytes32 node) public view returns (address)",
];

const RNS_ADDR_RESOLVER_ABI = [
  "function addr(bytes32 node) public view returns (address)",
];

const RNS_NAME_RESOLVER_ABI = [
  "function name(bytes32 node) external view returns (string)",
];

class RNSResolver implements BaseResolver {
  name: string;

  rnsRegistryContract: Contract;

  RNSProvider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.name = "rns";
  }

  public async init(): Promise<void> {
    this.RNSProvider = new ethers.providers.JsonRpcProvider(ROOTSTOCK_RPC_NODE);
    this.rnsRegistryContract = new Contract(
        RNS_REGISTRY_ADDRESS,
        RNS_REGISTRY_ABI,
        this.RNSProvider
      );
  }

  public async resolveReverseName(address: string): Promise<string | null> {
    const reverseRecordHash = utils.namehash(
        `${stripHexPrefix(address)}.addr.reverse`
      );

      const resolverAddress = await this.rnsRegistryContract.resolver(
        reverseRecordHash
      );

      if (resolverAddress === constants.AddressZero) {
        return null;
      }

      const nameResolverContract = new Contract(
        resolverAddress,
        RNS_NAME_RESOLVER_ABI,
        this.RNSProvider
      );

      const name = await nameResolverContract.name(reverseRecordHash);

      if (name === undefined) {
        return null;
      }

      return name;
  }

  public async resolveAddress(
    name: string,
    _coin: CoinType = "RSK"
  ): Promise<string | null> {
    const nameHash = utils.namehash(name)
    const resolverAddress = await this.rnsRegistryContract.resolver(nameHash)

    if (resolverAddress === constants.AddressZero) {
      return null
    }

    const addrResolverContract = new Contract(
        resolverAddress,
        RNS_ADDR_RESOLVER_ABI,
        this.RNSProvider
      )

    const address = await addrResolverContract.addr(nameHash)

      if (address === undefined || address === null) {
        return null
      }

     return address.toLowerCase();
  }

  public isSupportedName(name: string): boolean {
    return getTLD(name) === "rsk";
  }
}

export default RNSResolver;
