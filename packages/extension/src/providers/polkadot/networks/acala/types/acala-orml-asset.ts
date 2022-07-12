import { ApiPromise } from "@polkadot/api";
import { OrmlTokensAccountData } from "@acala-network/types/interfaces/types-lookup";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { SubstrateToken } from "@/providers/polkadot/types/substrate-token";
import { BaseTokenOptions } from "@/types/base-token";

type AssetType =
  | "token"
  | "foreignAsset"
  | "stableAssetPoolToken"
  | "liquidCrowdloan";

interface AcalaOrmlAssetOptions extends BaseTokenOptions {
  assetType: AssetType;
  lookupValue: string | number;
}

export class AcalaOrmlAsset extends SubstrateToken {
  public assetType: AssetType;
  public lookupValue: string | number;

  constructor(options: AcalaOrmlAssetOptions) {
    super(options);

    this.assetType = options.assetType;
    this.lookupValue = options.lookupValue;
  }

  public async getUserBalance(api: ApiPromise, address: any): Promise<string> {
    const tokenLookup: Record<string, string | number> = {};
    tokenLookup[this.assetType] = this.lookupValue;

    return api.query.tokens.accounts(address, tokenLookup).then((res) => {
      const balance = (res as unknown as OrmlTokensAccountData).free.toString();
      this.balanceCache = balance;
      return balance;
    });
  }

  public async send(
    api: ApiPromise,
    to: string,
    amount: string
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return (api as ApiPromise).tx.balances.transferKeepAlive(to, amount);
  }
}
