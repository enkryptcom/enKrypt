import DomainState from "@/libs/domain-state";
import { getCustomError } from "@/libs/error";
import MarketData from "@/libs/market-data";
import { CustomErc20Token, TokenType } from "@/libs/tokens-state/types";
import { WindowPromise } from "@/libs/window-promise";
import { MiddlewareFunction } from "@enkryptcom/types";
import { isValidAddress } from "ethereumjs-util";
import EthereumProvider from "..";
import API from "../libs/api";
import { Erc20Token } from "../types/erc20-token";

interface WatchAssetParams {
  type?: string;
  options?: {
    address?: `0x${string}`;
    symbol?: string;
    decimals?: number;
    image?: string;
  };
}

enum AddAssetType {
  ERC20 = "ERC20",
}

type Params = WatchAssetParams | undefined;

const method: MiddlewareFunction = async function (
  this: EthereumProvider,
  payload,
  res,
  next
): Promise<void> {
  if (payload.method !== "wallet_watchAsset") return next();

  const params = payload.params as Params;

  if (!params || !params.options || !params.options.address) {
    return res(getCustomError("wallet_watchAsset: invalid params"));
  }

  if (params.type !== AddAssetType.ERC20) {
    return res(getCustomError(`Token type ${params.type} is not supported`));
  }

  const contractAddress = params.options.address;

  if (!isValidAddress(contractAddress)) {
    return res(getCustomError("wallet_watchAsset: invalid contract address"));
  }

  const domainState = new DomainState();
  const selectedAddress = await domainState.getSelectedAddress();

  const api = await this.network.api();

  const tokenInfo = await (api as API).getTokenInfo(contractAddress);

  let balance = "";

  const marketData = new MarketData();

  const marketInfo = await marketData.getMarketInfoByContracts(
    [contractAddress.toLowerCase()],
    this.network.coingeckoPlatform! ?? ""
  );

  const market = marketInfo[contractAddress.toLowerCase()];

  let icon = this.network.icon;
  let coingeckoID: string | undefined;

  if (market) {
    icon = market.image;
    coingeckoID = market.id;
  }

  const customToken: CustomErc20Token = {
    type: TokenType.ERC20,
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    decimals: tokenInfo.decimals,
    icon,
    coingeckoID,
    address: contractAddress,
  };

  if (tokenInfo.name !== "Unknown" && selectedAddress) {
    const erc20Token = new Erc20Token({
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      decimals: tokenInfo.decimals,
      icon,
      coingeckoID,
      contract: contractAddress,
    });

    try {
      const latestBalance = await erc20Token.getLatestUserBalance(
        api as API,
        selectedAddress
      );

      balance = latestBalance;
    } catch {
      // Balance defaults to ""
    }
  }

  const windowPromise = new WindowPromise();
  windowPromise
    .getResponse(
      this.getUIPath(this.UIRoutes.walletWatchAsset.path),
      JSON.stringify({
        ...payload,
        params: [customToken, balance, selectedAddress, this.network.name],
      }),
      true
    )
    .then(({ error, result }) => {
      if (error) return res(error);
      res(null, JSON.parse(result as string));
    });
};
export default method;
