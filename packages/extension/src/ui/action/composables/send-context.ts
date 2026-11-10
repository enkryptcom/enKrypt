import { BaseNetwork } from '@/types/base-network';
import { useNetworksStore } from '@action/store/networks-store';
import { useAccountsStore } from '@action/store/accounts-store';

/**
 * The network and accounts a send view works with, read from the stores once,
 * when the view is created.
 *
 * Each send view is written for one provider, so it has to keep the network it
 * was opened on. If the selection changes before the view is removed it must
 * not be handed a network of another provider, which is why it does not follow
 * the stores the way other views do.
 */
export default <T extends BaseNetwork = BaseNetwork>() => {
  const network = useNetworksStore().currentNetwork as T;
  const accountInfo = useAccountsStore().accountInfo;
  return { network, accountInfo };
};
