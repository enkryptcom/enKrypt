/**
 * @file Accounts of the popup's current network and which one is selected.
 *
 * The selected address is persisted per domain in DomainState. This store reads
 * it when a network's accounts are loaded and writes it when the selection changes.
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { EnkryptAccount } from '@enkryptcom/types';
import { fromBase } from '@enkryptcom/utils';
import DomainState from '@/libs/domain-state';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { sendToBackgroundFromAction } from '@/libs/messenger/extension';
import {
  getAccountsByNetworkName,
  getOtherSigners,
} from '@/libs/utils/accounts';
import { isWalletRestricted } from '@/libs/utils/screening';
import BTCAccountState from '@/providers/bitcoin/libs/accounts-state';
import EVMAccountState from '@/providers/ethereum/libs/accounts-state';
import SolAccountState from '@/providers/solana/libs/accounts-state';
import { MessageMethod } from '@/providers/ethereum/types';
import { BaseNetwork } from '@/types/base-network';
import { InternalMethods } from '@/types/messenger';
import { ProviderName } from '@/types/provider';
import { AccountsHeaderData } from '@action/types/account';
import { useNetworksStore } from './networks-store';

/** Providers that keep a list of the addresses a dapp is allowed to see. */
const approvedAddressStates = {
  [ProviderName.ethereum]: EVMAccountState,
  [ProviderName.bitcoin]: BTCAccountState,
  [ProviderName.solana]: SolAccountState,
};

const emptyAccounts = (): AccountsHeaderData => ({
  activeAccounts: [],
  inactiveAccounts: [],
  selectedAccount: null,
  activeBalances: [],
});

/**
 * Defines the store for the current network's accounts. It is filled by the
 * networks store whenever the current network is set.
 *
 * @property {Ref<AccountsHeaderData>} accountInfo - Accounts, selection and balances of the current network.
 * @property {Ref<{ isRestricted: boolean; address: string }>} isAddressRestricted - Screening result for the selected account.
 *
 * @computed {ComputedRef<EnkryptAccount[]>} activeAccounts - Accounts usable on the current network.
 * @computed {ComputedRef<EnkryptAccount[]>} inactiveAccounts - Accounts that belong to other signer types.
 * @computed {ComputedRef<EnkryptAccount | null>} selectedAccount - The selected account.
 * @computed {ComputedRef<string[]>} activeBalances - Native balances, in the same order as activeAccounts. '~' while loading.
 *
 * @method {Function} fetchAccounts - Reads the accounts of a network without changing the store.
 * @method {Function} setAccounts - Replaces the account data.
 * @method {Function} selectAccount - Selects an account, saves it and tells the dapp in the active tab.
 * @method {Function} checkAddress - Screens the selected account.
 * @method {Function} switchToUnrestrictedAccount - Selects an account other than the restricted one.
 * @method {Function} fetchBalances - Loads the native balance of every active account.
 */
export const useAccountsStore = defineStore('useAccountsStore', () => {
  const domainState = new DomainState();
  const publicKeyRing = new PublicKeyRing();
  const networksStore = useNetworksStore();

  /**
   * Replaced as a whole when a network's accounts are loaded. The selection and
   * the balances are updated in place, so a view that holds on to this object
   * keeps seeing them for as long as it belongs to the current network.
   */
  const accountInfo = ref<AccountsHeaderData>(emptyAccounts());
  const isAddressRestricted = ref<{ isRestricted: boolean; address: string }>({
    isRestricted: false,
    address: '',
  });

  const activeAccounts = computed(() => accountInfo.value.activeAccounts);
  const inactiveAccounts = computed(() => accountInfo.value.inactiveAccounts);
  const selectedAccount = computed(() => accountInfo.value.selectedAccount);
  const activeBalances = computed(() => accountInfo.value.activeBalances);

  /**
   * @method fetchAccounts - Reads the accounts of a network without changing the store.
   * The selected account is the one saved in DomainState when the network has it,
   * otherwise the first active account.
   * @param network - Network to read the accounts for
   */
  const fetchAccounts = async (
    network: BaseNetwork,
  ): Promise<AccountsHeaderData> => {
    const active = await getAccountsByNetworkName(network.name);
    const inactive = await publicKeyRing.getAccounts(
      getOtherSigners(network.signer),
    );
    const selectedAddress = await domainState.getSelectedAddress();
    const selected =
      active.find(acc => acc.address === selectedAddress) ?? active[0] ?? null;
    return {
      activeAccounts: active,
      inactiveAccounts: inactive,
      selectedAccount: selected,
      activeBalances: active.map(() => '~'),
    };
  };

  /**
   * @method setAccounts - Replaces the account data.
   * The networks store calls this in the same tick as it sets the current network,
   * so that accounts are never rendered against a network they do not belong to.
   * @param accounts - Accounts returned by fetchAccounts
   */
  const setAccounts = (accounts: AccountsHeaderData) => {
    accountInfo.value = accounts;
  };

  /**
   * @method checkAddress - Screens the selected account and updates isAddressRestricted.
   */
  const checkAddress = async () => {
    isAddressRestricted.value = { isRestricted: false, address: '' };
    const account = accountInfo.value.selectedAccount;
    if (!account) return;
    const address = networksStore.currentNetwork.displayAddress(
      account.address,
    );
    const isRestricted = await isWalletRestricted(address);
    if (isRestricted) {
      isAddressRestricted.value = { isRestricted, address };
    }
  };

  /**
   * @method selectAccount - Selects an account. Unless the address is restricted,
   * it then approves the address for the current domain on Ethereum, Bitcoin and
   * Solana networks, saves the selection in DomainState and tells the dapp in the
   * active tab.
   * @param account - One of the active accounts
   */
  const selectAccount = async (account: EnkryptAccount) => {
    const network = networksStore.currentNetwork;
    accountInfo.value.selectedAccount = account;
    await checkAddress();
    if (isAddressRestricted.value.isRestricted) return;
    if (Object.keys(approvedAddressStates).includes(network.provider)) {
      const AccountState = new approvedAddressStates[
        network.provider as keyof typeof approvedAddressStates
      ]();
      const domain = await domainState.getCurrentDomain();
      AccountState.addApprovedAddress(account.address, domain);
    }
    await domainState.setSelectedAddress(account.address);
    await sendToBackgroundFromAction({
      message: JSON.stringify({
        method: InternalMethods.sendToTab,
        params: [
          {
            method: MessageMethod.changeAddress,
            params: [network.displayAddress(account.address)],
          },
        ],
      }),
      provider: network.provider,
      tabId: await domainState.getCurrentTabId(),
    });
  };

  /**
   * @method switchToUnrestrictedAccount - Selects the first active account that is not the restricted one.
   */
  const switchToUnrestrictedAccount = async () => {
    const network = networksStore.currentNetwork;
    const account = accountInfo.value.activeAccounts.find(
      acc =>
        network.displayAddress(acc.address) !==
        isAddressRestricted.value.address,
    );
    if (account) await selectAccount(account);
  };

  /**
   * @method fetchBalances - Loads the native balance of every active account on the current network.
   * The balances are written to the accounts they were loaded for. If the accounts
   * have been replaced in the meantime, the new ones are left untouched.
   */
  const fetchBalances = async () => {
    const network = networksStore.currentNetwork;
    const accounts = accountInfo.value;
    if (!network.api) return;
    try {
      const api = await network.api();
      const balances = await Promise.all(
        accounts.activeAccounts.map(acc => api.getBalance(acc.address)),
      );
      accounts.activeBalances = balances.map(bal =>
        fromBase(bal, network.decimals),
      );
    } catch (e) {
      console.error(e);
    }
  };

  return {
    accountInfo,
    isAddressRestricted,
    activeAccounts,
    inactiveAccounts,
    selectedAccount,
    activeBalances,
    fetchAccounts,
    setAccounts,
    selectAccount,
    checkAddress,
    switchToUnrestrictedAccount,
    fetchBalances,
  };
});
