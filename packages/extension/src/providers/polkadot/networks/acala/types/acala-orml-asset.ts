import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import { ApiPromise } from "@polkadot/api";
import { OrmlTokensAccountData } from "@acala-network/types/interfaces/types-lookup";

interface AcalaOrmlAssetOptions extends BaseTokenOptions {
  assetType:
    | "token"
    | "foreignAsset"
    | "stableAssetPoolToken"
    | "liquidCrowdloan";
  lookupValue: string | number;
}

export class AcalaOrmlAsset extends BaseToken {
  private assetType: string;
  private lookupValue: string | number;

  constructor(options: AcalaOrmlAssetOptions) {
    super(options);

    this.assetType = options.assetType;
    this.lookupValue = options.lookupValue;
  }

  public async getUserBalance(api: any, address: any): Promise<number> {
    const tokenLookup: Record<string, string | number> = {};
    tokenLookup[this.assetType] = this.lookupValue;

    return (api as ApiPromise).query.tokens
      .accounts(address, tokenLookup)
      .then((res) => {
        return (res as unknown as OrmlTokensAccountData).free.toNumber();
      });
  }

  public async send(api: any, to: string, amount: number): Promise<any> {
    return (api as ApiPromise).tx.balances.transferKeepAlive(to, amount);
  }
}
