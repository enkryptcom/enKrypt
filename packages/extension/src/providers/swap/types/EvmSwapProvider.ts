import { toBase } from "@/libs/utils/units";
import API from "@/providers/ethereum/libs/api";
import Transaction from "@/providers/ethereum/libs/transaction";
import { GasPriceTypes } from "@/providers/ethereum/libs/transaction/types";
import { Erc20Token } from "@/providers/ethereum/types/erc20-token";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { TransactionSigner } from "@/providers/ethereum/ui/libs/signer";
import { BaseToken } from "@/types/base-token";
import { EnkryptAccount } from "@enkryptcom/types";
import BigNumber from "bignumber.js";
import { isAddress, numberToHex, toBN } from "web3-utils";
import {
  Quote,
  QuoteInfo,
  SwapProvider,
  TokenData,
  TradeInfo,
  TradePreview,
  TradeStatus,
} from "./SwapProvider";

const HOST_URL = "https://mainnet.mewwallet.dev/v4";
const REQUEST_CACHER = "https://requestcache.mewapi.io/?url=";
const GET_LIST = "/swap/list";
const GET_QUOTE = "/swap/quote";
const GET_TRADE = "/swap/trade";
const GET_RATE = "/swap/rate";
const REQUEST_TIMEOUT = 5000;

type TradeResponseTransaction = {
  to: `0x${string}`;
  from: `0x${string}`;
  data: `0x${string}`;
  value: `0x${string}`;
  gas: `0x${string}`;
};

type TradeResponse = {
  provider: string;
  from_amount: string;
  to_amount: string;
  gas: `0x${string}`;
  price_impact: string;
  max_slippage: string;
  minimum: string;
  fee: string;
  transfer_fee: boolean;
  transactions: TradeResponseTransaction[];
};

export class EvmSwapProvider extends SwapProvider {
  public supportedDexes = ["ZERO_X", "ONE_INCH", "PARASWAP"];
  public supportedNetworks: string[] = ["ETH", "MATIC", "BSC"];

  constructor() {
    super();
    // this.providerName = providerName;
  }

  public isValidAddress(address: string): boolean {
    return isAddress(address);
  }

  public async getSupportedTokens(chain: string): Promise<Erc20Token[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error("Request timedout");
      }, REQUEST_TIMEOUT);

      const res = await fetch(
        `${REQUEST_CACHER}${HOST_URL}${GET_LIST}?chain=${chain}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const { tokens }: { tokens: TokenData[] } = await res.json();

      return tokens.map((tokenData: TokenData) => {
        return new Erc20Token({
          decimals: tokenData.decimals,
          contract: tokenData.contract_address,
          icon: tokenData.icon && tokenData.icon !== "" ? tokenData.icon : "",
          symbol: tokenData.symbol,
          name: tokenData.name ?? tokenData.symbol,
          price: tokenData.price,
          balance: toBase("1", tokenData.decimals),
        });
      });
    } catch {
      throw new Error("Could not fetch tokens");
    }
  }

  public async getTradePreview(
    chain: string,
    fromToken: Erc20Token,
    toToken: Erc20Token
  ): Promise<TradePreview | null> {
    if (!fromToken.contract || !toToken.contract) {
      return null;
    }

    const params = new URLSearchParams();
    params.append("fromContractAddress", fromToken.contract);
    params.append("toContractAddress", toToken.contract);
    params.append("chain", chain);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error("Request timedout");
      }, REQUEST_TIMEOUT);

      const res = await fetch(`${HOST_URL}${GET_RATE}?${params.toString()}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const rates = await res.json();
      const { min, max } = await this.getMinMaxAmount(fromToken);
      return {
        min,
        max,
        rates,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public getMinMaxAmount(fromToken: BaseToken): Promise<{
    min: string;
    max: string;
  }> {
    return Promise.resolve({
      min: new BigNumber(1)
        .dividedBy(new BigNumber(10).pow(fromToken.decimals))
        .toFixed(),
      max: new BigNumber(1)
        .multipliedBy(new BigNumber(10).pow(fromToken.decimals))
        .toFixed(),
    });
  }

  public async getQuote(
    chain: string,
    fromToken: Erc20Token,
    toToken: Erc20Token,
    fromAmount: string
  ): Promise<QuoteInfo[]> {
    if (!isAddress(fromToken.contract) || !isAddress(toToken.contract))
      return [];
    const params = new URLSearchParams();
    params.append("fromContractAddress", fromToken.contract);
    params.append("toContractAddress", toToken.contract);
    params.append("amount", fromAmount);
    params.append("chain", chain);

    const { min, max } = await this.getMinMaxAmount(fromToken);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error("Request timedout");
      }, REQUEST_TIMEOUT);

      const res = await fetch(`${HOST_URL}${GET_QUOTE}?${params.toString()}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const { quotes }: { quotes: Quote[] } = await res.json();

      return quotes.map(({ exchange, amount, dex }) => {
        return {
          exchange,
          min,
          max,
          amount,
          dex,
        };
      });
    } catch {
      throw new Error("Could not retrieve pairs");
    }

    return [];
  }

  public async getTrade(
    chain: string,
    fromAddress: string,
    _toAddress: string,
    fromToken: Erc20Token,
    toToken: Erc20Token,
    fromAmount: string
  ): Promise<TradeInfo[]> {
    try {
      if (!fromToken.contract || !toToken.contract) {
        return [];
      }

      const params = new URLSearchParams();
      params.append("chain", chain);
      params.append("fromContractAddress", fromToken.contract);
      params.append("toContractAddress", toToken.contract);
      params.append("amount", fromAmount);
      params.append("address", fromAddress);
      params.append("platform", "web");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error("Request timedout");
      }, REQUEST_TIMEOUT);

      const res = await fetch(`${HOST_URL}${GET_TRADE}?${params.toString()}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: TradeResponse[] = await res.json();

      return data.map((tradeResponse) => {
        return {
          provider: tradeResponse.provider,
          fromAmount,
          minimumReceived: tradeResponse.minimum,
          maxSlippage: tradeResponse.max_slippage,
          priceImpact: tradeResponse.price_impact,
          fee: tradeResponse.fee,
          gas: tradeResponse.gas,
          txs: tradeResponse.transactions,
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public getStatus(): TradeStatus {
    // TODO get status for activity tab

    return TradeStatus.UNKNOWN;
  }

  public async executeTrade(
    network: EvmNetwork,
    fromAccount: EnkryptAccount,
    trade: TradeInfo
  ): Promise<`0x${string}`[]> {
    const api = (await network.api()) as API;
    await api.init();
    const web3 = api.web3;

    const nonce = await web3.eth.getTransactionCount(fromAccount.address);

    const txPromises = trade.txs
      .map(({ data, value, gas, to }, index) => {
        return new Transaction(
          {
            from: fromAccount.address as `0x${string}`,
            to: to as `0x${string}`,
            data,
            value,
            gas,
            chainId: numberToHex(network.chainID) as `0x{string}`,
            nonce: `0x${toBN(nonce)
              .addn(index)
              .toString("hex")}` as `0x${string}`,
          },
          web3
        );
      })
      .map((tx) =>
        tx
          .getFinalizedTransaction({
            gasPriceType: GasPriceTypes.ECONOMY,
          })
          .then((finalizedTx) =>
            TransactionSigner({
              account: fromAccount,
              network: network,
              payload: finalizedTx,
            }).then((signedTx) =>
              web3.eth
                .sendSignedTransaction(
                  `0x${signedTx.serialize().toString("hex")}`
                )
                .on("transactionHash", (hash: string) => {
                  // TODO log to activity
                  console.log("hash", hash);
                })
                .then((receipt) => receipt.transactionHash as `0x${string}`)
            )
          )
      );

    return Promise.all(txPromises);
  }
}
