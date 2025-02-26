import { TokenBalance } from './types/tokenbalance-mew';
import { NATIVE_TOKEN_ADDRESS } from '../common';
import { numberToHex } from '@enkryptcom/utils';
import { BaseNetwork } from '@/types/base-network';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { BNType } from '@/providers/common/types';
import { toBN } from 'web3-utils';

const getBalances = (network: BaseNetwork, address: string) => {
  const solConnection = new Connection(network.node);
  return Promise.all([
    solConnection.getParsedTokenAccountsByOwner(new PublicKey(address), {
      programId: TOKEN_PROGRAM_ID,
    }),
    solConnection.getParsedTokenAccountsByOwner(new PublicKey(address), {
      programId: TOKEN_2022_PROGRAM_ID,
    }),
  ]).then(([tokenAccounts, tokenAccounts2022]) => {
    const accounts = tokenAccounts.value.concat(tokenAccounts2022.value);
    const balances: TokenBalance[] = [];
    const balanceObj = {} as Record<string, BNType>;
    accounts.forEach(acc => {
      const balance = numberToHex(
        (acc.account.data as any).parsed.info.tokenAmount.amount,
      );
      if (balance === '0x0') return;
      const contract = (acc.account.data as any).parsed.info.mint;
      if (!balanceObj[contract]) balanceObj[contract] = toBN(0);
      balanceObj[contract] = balanceObj[contract].add(toBN(balance));
    });
    Object.keys(balanceObj).forEach(contract => {
      balances.push({
        balance: numberToHex(balanceObj[contract]),
        contract,
      });
    });
    return solConnection.getBalance(new PublicKey(address)).then(balance => {
      balances.unshift({
        balance: numberToHex(balance),
        contract: NATIVE_TOKEN_ADDRESS,
      });
      return balances;
    });
  });
};

export default getBalances;
