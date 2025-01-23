import { SupportedNetworkNames, TokenBalance } from './types/tokenbalance-mew';
import { NetworkEndpoints } from '@/providers/ethereum/libs/activity-handlers/providers/etherscan/configs';
import { NATIVE_TOKEN_ADDRESS } from '../common';
import { numberToHex } from 'web3-utils';

interface TokenBalanceType {
  token: string;
  quantity: string;
  error?: unknown;
}

interface TokenResponseItem {
  token: {
    address: string;
    decimals: string;
    name: string;
    symbol: string;
  };
  value: string;
}

interface TokenResponse {
  items: TokenResponseItem[];
}

const getBlockscoutBalances = (
  chain: SupportedNetworkNames,
  address: string,
): Promise<TokenBalance[]> => {
  const encodedAddress = encodeURIComponent(address);
  const nativeTokenUrl = `${NetworkEndpoints[chain]}api/v2/addresses/${encodedAddress}`;
  const tokenBalancesUrl = `${NetworkEndpoints[chain]}api/v2/addresses/${encodedAddress}/tokens?type=ERC-20`;

  return Promise.all([
    fetch(nativeTokenUrl).then(res => res.json()),
    fetch(tokenBalancesUrl).then(res => res.json()),
  ])
    .then(([nativeResponse, tokenResponse]: [any, TokenResponse]) => {
      if (!nativeResponse?.coin_balance || !tokenResponse?.items) {
        return Promise.reject('Error fetching balance data');
      }

      if (Number.isNaN(Number(nativeResponse.coin_balance))) {
        return Promise.reject('Invalid native token balance');
      }

      // Map native token balance
      const nativeBalance: TokenBalanceType = {
        token: NATIVE_TOKEN_ADDRESS,
        quantity: nativeResponse.coin_balance,
      };

      // Map token balances
      const tokenBalances: TokenBalanceType[] = Array.isArray(
        tokenResponse?.items,
      )
        ? tokenResponse.items
            .filter(
              item =>
                item?.token?.address &&
                typeof item.token.address === 'string' &&
                item.value !== undefined,
            )
            .map(item => ({
              token: item.token.address.toLowerCase(),
              quantity: item.value,
            }))
        : [];

      // Merge native token and token balances
      const allBalances = [nativeBalance, ...tokenBalances];

      // Convert to TokenBalance format
      return allBalances.map(tb => ({
        contract: tb.token,
        balance: numberToHex(tb.quantity), // Convert to hex format
      }));
    })
    .catch(error => {
      console.error('Error fetching balances:', error);
      return [
        {
          contract: NATIVE_TOKEN_ADDRESS,
          balance: '0x0',
        },
      ];
    });
};

export default getBlockscoutBalances;
