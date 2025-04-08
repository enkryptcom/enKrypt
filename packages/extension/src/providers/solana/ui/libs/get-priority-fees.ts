import { SolanaNetwork } from '../../types/sol-network';

const getPrioritizationFees = async (
  network: SolanaNetwork,
): Promise<{ low: number; medium: number; high: number }> => {
  return fetch(network.node, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'rpd-op-123',
      method: 'getPriorityFeeEstimate',
      params: [
        {
          options: {
            includeAllPriorityFeeLevels: true,
          },
        },
      ],
    }),
  })
    .then(res => res.json())
    .then(json => {
      const typedJson = json as {
        result: {
          priorityFeeLevels: {
            min: number;
            low: number;
            medium: number;
            high: number;
          };
        };
      };
      return {
        low: typedJson.result.priorityFeeLevels.low,
        medium: typedJson.result.priorityFeeLevels.medium,
        high: typedJson.result.priorityFeeLevels.high,
      };
    })
    .catch(e => {
      return { low: 0, medium: 0, high: 0 };
    });
};

export default getPrioritizationFees;
