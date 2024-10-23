import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import {
  Activity,
  ActivityStatus,
  ActivityType,
  EthereumRawInfo,
} from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import { decodeTx } from '../../../transaction/decoder';
import { NetworkEndpoints } from './configs';

type GraphQLResponse<T> = GraphQLErrorResponse | GraphQLOkResponse<T>;

type GraphQLOkResponse<T> = {
  data: T;
  errors?: undefined;
};

type GraphQLErrorResponse = {
  errors: { message: string }[];
  result?: undefined;
};

type TransactionListResult = {
  transactions: {
    entries: {
      block: {
        /** ISO8601 string */
        timestamp: string;
      };
      /** bytes32 */
      block_hash: `0x${string}`;
      block_number: number;
      /** bytes32 transaction hash */
      hash: `0x${string}`;
      /** transaction index */
      index: number;
      nonce: number;
      from_account: {
        /** bytes20 string */
        eth_address: `0x${string}`;
      };
      to_account: null | {
        /** bytes20 string */
        eth_address: `0x${string}`;
      };
      polyjuice: {
        /** base10 bigint string */
        gas_limit: string;
        /** base10 bigint string */
        gas_price: string;
        /** base10 bigint string */
        gas_used: string;
        /** byte string */
        input: `0x${string}`;
        /** bytes20 */
        created_contract_address_hash: null | `0x${string}`;
        status: 'FAILED' | 'SUCCEEDED';
        /** base10 bigint string */
        value: string;
      };
    }[];
  };
};

const getAddressActivity = async (
  address: string,
  endpoint: string,
): Promise<EthereumRawInfo[]> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      operationName: 'getTransactions',
      variables: {
        address: address,
        limit: 50,
      },
      query: /* graphql */ `
query getTransactions(
  $address: HashAddress!
  $limit: Int
) {
  transactions(
    input: {
      limit: $limit
      combine_from_to: true
      from_eth_address: $address
      to_eth_address: $address
      sorter: [
        { sort_type: ASC, sort_value: BLOCK_NUMBER }
        { sort_type: ASC, sort_value: INDEX }
        { sort_type: ASC, sort_value: HASH }
      ]
    }
  ) {
    entries {
      block {
        timestamp
      }
      block_hash
      block_number
      index
      hash
      nonce
      from_account {
        eth_address
      }
      to_account {
        eth_address
      }
      polyjuice {
        gas_limit
        gas_price
        gas_used
        input
        created_contract_address_hash
        status
        value
      }
    }
  }
}
`,
    }),
  });

  if (!response.ok) {
    // Received error HTTP response, probably something like a gateway error,
    // blocked, rate limited, server down, etc
    let msg = await response
      .text()
      .catch(err => `Failed to decode response text: ${String(err)}`);
    const len = msg.length;
    if (len > 255 + 3) msg = `${msg.slice(0, 255)}... (255/${len})`;
    throw new Error(
      `HTTP error fetching transactions ${response.status} ${response.statusText}: ${msg}`,
    );
  }

  const result: GraphQLResponse<TransactionListResult> = await response.json();

  if (result.errors) {
    // GraphQL error, probably something wrong with query or variables
    let msg = result.errors[0].message ?? '???';
    const len = msg.length;
    if (len > 512 + 3) msg = `${msg.slice(0, 512)}... (512/${len})`;
    throw new Error(`GraphQL error fetching transactions: ${msg}`);
  }

  const rawdata: EthereumRawInfo[] = result.data.transactions.entries.map(
    tx => ({
      blockHash: tx.block_hash,
      blockNumber: '0x' + tx.block_number.toString(16),
      contractAddress: tx.polyjuice.created_contract_address_hash,
      effectiveGasPrice: '0x' + BigInt(tx.polyjuice.gas_price).toString(16),
      from: tx.from_account.eth_address,
      to: tx.to_account?.eth_address ?? null,
      gas: '0x' + BigInt(tx.polyjuice.gas_limit).toString(16),
      gasUsed: '0x' + BigInt(tx.polyjuice.gas_used).toString(16),
      status: tx.polyjuice.status === 'SUCCEEDED' ? true : false,
      transactionHash: tx.hash,
      data: tx.polyjuice.input,
      nonce: '0x' + tx.nonce.toString(16),
      value: '0x' + BigInt(tx.polyjuice.value).toString(16),
      timestamp: new Date(tx.block.timestamp).valueOf(),
    }),
  );

  return rawdata;
};

export default async (
  network: BaseNetwork,
  address: string,
): Promise<Activity[]> => {
  address = address.toLowerCase();
  const enpoint =
    NetworkEndpoints[network.name as keyof typeof NetworkEndpoints];
  const activities = await getAddressActivity(address, enpoint);

  const Promises = activities.map(activity => {
    return decodeTx(activity, network as EvmNetwork).then(txData => {
      return {
        from: activity.from,
        to: activity.contractAddress
          ? activity.contractAddress
          : txData.tokenTo!,
        isIncoming: activity.from !== address,
        network: network.name,
        rawInfo: activity,
        status: ActivityStatus.success,
        timestamp: activity.timestamp ? activity.timestamp : 0,
        value: txData.tokenValue,
        transactionHash: activity.transactionHash,
        type: ActivityType.transaction,
        token: {
          decimals: txData.tokenDecimals,
          icon: txData.tokenImage,
          name: txData.tokenName,
          symbol: txData.tokenSymbol,
          price: txData.currentPriceUSD.toString(),
        },
      };
    });
  });
  return Promise.all(Promises);
};
