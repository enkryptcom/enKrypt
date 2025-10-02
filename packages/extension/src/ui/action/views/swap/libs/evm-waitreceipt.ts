import { BaseNetwork } from '@/types/base-network';
import EvmAPI from '@/providers/ethereum/libs/api';

const waitForReceipt = async (
  hashes: string[],
  network: BaseNetwork,
  timeOutSecs: number,
) => {
  const timeNow = new Date().getTime();
  if (!hashes.length) return Promise.resolve();
  const api = await network.api();
  const web3 = (api as EvmAPI).web3;
  let promises = hashes.map(hash => web3.getTransactionReceipt(hash));
  while ((await Promise.all(promises)).find(i => i === null) === null) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (new Date().getTime() - timeNow > timeOutSecs * 1000)
      return Promise.reject('Transactions taking too long, timedout');
    promises = hashes.map(hash => web3.getTransactionReceipt(hash));
  }
};

export default waitForReceipt;
