import { unref, type MaybeRef } from 'vue';
import { BaseNetwork } from '@/types/base-network';
import { BaseFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/base-firo-wallet';
import { NetworkNames } from '@enkryptcom/types/dist';

const wallet = new BaseFiroWallet();

export async function getSparkAddress(
  network: MaybeRef<BaseNetwork>,
  selectedAddress: MaybeRef<string>,
) {
  const selectedNetwork = unref(network);
  const selectedAddressData = unref(selectedAddress);

  if (selectedNetwork?.name !== NetworkNames.Firo) {
    return null;
  }

  if (!selectedAddressData) {
    return null;
  }

  const displayAddress = selectedNetwork.displayAddress(selectedAddressData);

  return wallet.getSparkAddressAsync(displayAddress);
}
