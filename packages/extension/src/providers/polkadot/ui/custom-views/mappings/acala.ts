import { nativeTransfer } from "./substrate";
import TransferView from "../transfer-approvetx.vue";
import { SubstrateNetwork } from "@/providers/polkadot/types/substrate-network";
import { AcalaOrmlAsset } from "@/providers/polkadot/networks/acala/types/acala-orml-asset";
import { MethodMap, TransferProps } from "../types";
import { SubstrateNativeToken } from "@/providers/polkadot/types/substrate-native-token";
import { polkadotEncodeAddress } from "@enkryptcom/utils";

const transferCurrency = (
  network: SubstrateNetwork,
  args: any
): TransferProps | null => {
  const to = args.dest
    ? polkadotEncodeAddress(args.dest.Id, network.prefix) ?? null
    : null;
  const assetType = (
    args.currency_id ? Object.keys(args.currency_id) : [null]
  )[0];
  const rawAmount: string | null = args.amount ?? null;

  if (to !== null && assetType !== null && rawAmount !== null) {
    const baseToken = network.assets.find((token) => {
      const ormlToken = token as AcalaOrmlAsset;
      if (!ormlToken.assetType) return false;

      if (
        ormlToken.assetType.toLowerCase() === assetType.toLowerCase() &&
        ormlToken.lookupValue.toString().toLowerCase() ===
          args.currency_id[assetType].toString().toLowerCase()
      )
        if ((token as AcalaOrmlAsset).assetType) {
          return (
            (token as AcalaOrmlAsset).assetType.toLowerCase() ===
            assetType.toLowerCase()
          );
        } else {
          return false;
        }
    });

    if (baseToken) {
      const amount = rawAmount.replaceAll(",", "");
      return { to, token: baseToken, amount };
    }
  }

  return null;
};

const transferNativeCurrency = (
  network: SubstrateNetwork,
  args: any
): TransferProps | null => {
  const to = args.dest
    ? polkadotEncodeAddress(args.dest.Id, network.prefix) ?? null
    : null;
  const token = new SubstrateNativeToken({
    decimals: network.decimals,
    icon: network.icon,
    name: network.currencyNameLong,
    symbol: network.name,
  });
  const rawAmount: string | null = args.amount ?? null;

  if (to !== null && rawAmount !== null) {
    const amount = rawAmount.replaceAll(",", "");
    return { to, token, amount };
  }
  return null;
};

const methodsToArgs: MethodMap = {
  "balances.transferKeepAlive": [TransferView, nativeTransfer],
  "currencies.transfer": [TransferView, transferCurrency],
  "currencies.transferNativeCurrency": [TransferView, transferNativeCurrency],
};

export default methodsToArgs;
