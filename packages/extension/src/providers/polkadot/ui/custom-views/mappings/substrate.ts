import { SubstrateNativeToken } from "../../../types/substrate-native-token";
import { SubstrateNetwork } from "../../../types/substrate-network";
import { polkadotEncodeAddress } from "@enkryptcom/utils";

export const nativeTransfer = (network: SubstrateNetwork, data: any) => {
  const to = polkadotEncodeAddress(data.dest["Id"], network.prefix);
  const token = new SubstrateNativeToken({
    name: network.name_long,
    symbol: network.name,
    coingeckoID: network.coingeckoID,
    decimals: network.decimals,
    icon: network.icon,
  });
  const amount =
    Number(data.value.replaceAll(",", "")) / 10 ** network.decimals;
  return { to, token, amount };
};
