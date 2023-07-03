import { ActivityHandlerType } from "@/libs/activity-state/types";
import cacheFetch from "@/libs/cache-fetch";
import { BaseNetwork } from "@/types/base-network";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";

const TTL = 30000;

type ExtrinsicData = {
  amount: number;
  block_index: string;
  block_number: string;
  fee: number;
  from_owner: string;
  from_owner_normalized: string;
  hash: string;
  method: string;
  section: string;
  success: boolean;
  timestamp: number;
  to_owner: string;
  to_owner_normalized: string;
};

const query = `
  query getLastTransfers($orderBy: ExtrinsicOrderByParams = {}, $where: ExtrinsicWhereParams = {}) {
    extrinsics(limit: 50, offset: 0, order_by: $orderBy, where: $where) {
      data { 
        block_number 
        block_index 
        amount 
        fee 
        from_owner_normalized 
        hash 
        success 
        timestamp 
        to_owner_normalized
      }
      timestamp
    }
  }
`.replace(/[\n ]+/g, " ");

const getVariables = (address: string) => ({
  orderBy: { timestamp: "desc" },
  where: {
    _and: [
      { amount: { _neq: 0 } },
      {
        method: {
          _in: ["transfer", "transfer_all", "transfer_keep_alive"],
        },
      },
      { section: { _eq: "Balances" } },
      {
        _or: [
          { from_owner_normalized: { _eq: address } },
          { to_owner_normalized: { _eq: address } },
        ],
      },
    ],
  },
});

function getLastTransfersByAddress(
  graphqlEndpoint: string,
  address: string
): Promise<ExtrinsicData[]> {
  const queryParams = new URLSearchParams({
    query,
    variables: JSON.stringify(getVariables(address)),
  });

  const url = `${graphqlEndpoint}?${queryParams.toString()}`;

  return cacheFetch({ url }, TTL)
    .then((response) => {
      return response.data.extrinsics.data;
    })
    .catch((reason) => {
      console.error("Failed to fetch activity", reason);

      return [];
    });
}

const transform = (
  address: string,
  network: BaseNetwork,
  activity: ExtrinsicData
): Activity => ({
  from: activity.from_owner_normalized,
  to: activity.from_owner_normalized,
  isIncoming: activity.from_owner_normalized !== address,
  network: network.name,
  rawInfo: {
    from: activity.from_owner_normalized,
    to: activity.to_owner_normalized,
    success: activity.success,
    hash: activity.hash,
    block_num: parseInt(activity.block_number),
    block_timestamp: activity.timestamp,
    module: activity.section,
    amount: activity.amount.toString(),
    fee: activity.fee.toString(),
    nonce: 0,
    asset_symbol: network.currencyName,
    asset_type: "",
  },
  status: activity.success ? ActivityStatus.success : ActivityStatus.failed,
  timestamp: activity.timestamp * 1000,
  value: activity.amount + "".padStart(network.decimals, "0"),
  transactionHash: activity.block_index,
  type: ActivityType.transaction,
  token: {
    decimals: network.decimals,
    icon: network.icon,
    name: network.currencyNameLong,
    symbol: network.currencyName,
  },
});

export const getActivityHandler = (
  graphqlEndpoint: string
): ActivityHandlerType => {
  return async (network: BaseNetwork, address: string) => {
    const transfers = await getLastTransfersByAddress(graphqlEndpoint, address);

    return transfers.map((transfer) => transform(address, network, transfer));
  };
};
