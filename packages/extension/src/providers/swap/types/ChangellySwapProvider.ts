import { Erc20Token } from "@/providers/ethereum/types/erc20-token";
import { BaseToken } from "@/types/base-token";
import { UnknownToken } from "@/types/unknown-token";
import { v4 as uuidv4 } from "uuid";
import EvmAPI from "@/providers/ethereum/libs/api";
import {
  QuoteInfo,
  SwapProvider,
  Trade,
  TradeInfo,
  TradePreview,
  TradeStatus,
  TransactionInfo,
} from "./SwapProvider";
import { toBase } from "@/libs/utils/units";
import { numberToHex, toBN } from "web3-utils";
import { BaseNetwork } from "@/types/base-network";
import { EnkryptAccount } from "@enkryptcom/types";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import Transaction from "@/providers/ethereum/libs/transaction";
import { GasPriceTypes } from "@/providers/ethereum/libs/transaction/types";
import { TransactionSigner as SubstrateTransactionSigner } from "@/providers/polkadot/ui/libs/signer";
import { TransactionSigner as EvmTransactionSigner } from "@/providers/ethereum/ui/libs/signer";
import { getNetworkByName } from "@/libs/utils/networks";
import { ApiPromise } from "@polkadot/api";
import { SubstrateToken } from "@/providers/polkadot/types/substrate-token";
import { TypeRegistry } from "@polkadot/types";
import type { SignerResult } from "@polkadot/api/types";
import { u8aToHex } from "@polkadot/util";

interface ChangellyTokenInfo {
  contractAddress?: string;
  fullName: string;
  ticker: string;
  fixRateEnabled: boolean;
  coingeckoID?: string;
  image: string;
  price?: string;
}

interface ChangellyTrade extends Trade {
  amountExpectedFrom: string;
  amountExpectedTo: string;
  amountTo: string;
  apiExtraFee: string;
  binaryPayload: string | null;
  changellyFee: string;
  createdAt: string;
  currencyFrom: string;
  currencyTo: string;
  id: string;
  kycRequired: boolean;
  payTill: string;
  payinAddress: string;
  payinExtraId: string | null;
  payoutAddress: string;
  refundAddress: string;
  signature: string | null;
  status: string;
  trackUrl: string | null;
}

type ChangellyFixedRateResponse = {
  from: string;
  id: string;
  max: string;
  maxFrom: string;
  maxTo: string;
  min: string;
  minFrom: string;
  minTo: string;
  result: string;
  to: string;
};

const HOST_URL = "https://swap.mewapi.io/changelly";
const REQUEST_CACHER = "https://requestcache.mewapi.io/?url=";
const REQUEST_TIMEOUT = 5000;

export class ChangellySwapProvider extends SwapProvider {
  public supportedNetworks: string[] = ["KSM", "DOT", "ETH", "BSC", "MATIC"];
  public supportedDexes = ["CHANGELLY"];
  constructor() {
    super();
  }

  public isValidAddress(): boolean {
    // TODO make changelly api call for address validation
    return true;
  }

  public async getSupportedTokens(): Promise<BaseToken[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT);

      const res = await fetch(`${REQUEST_CACHER}${HOST_URL}`, {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: uuidv4(),
          jsonrpc: "2.0",
          method: "getCurrenciesFull",
          params: {},
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      const tokenData = (data.result as ChangellyTokenInfo[])
        .filter((tokenData) => tokenData.fixRateEnabled)
        .map((tokenData) => {
          // TODO switch with hard coded IDs
          const coingeckoID = tokenData.fullName
            .toLowerCase()
            .split(" ")
            .join("-");
          return { coingeckoID, ...tokenData };
        });

      const coingeckoIDs = tokenData
        .map(({ coingeckoID }) => [coingeckoID])
        .join(",");

      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append("ids", coingeckoIDs);
      urlSearchParams.append("vs_currencies", "usd");

      const pricesRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?${urlSearchParams.toString()}`
      );

      const prices = await pricesRes.json();

      Object.keys(prices).forEach((cgid) => {
        const token = tokenData.find((token) => token.coingeckoID === cgid);

        if (token) {
          token.price = prices[cgid]["usd"];
        }
      });

      return tokenData.map((tokenData) => {
        const tokenOptions = {
          name: tokenData.fullName,
          symbol: tokenData.ticker,
          decimals: 0,
          icon: tokenData.image,
          balance: "1",
          price: tokenData.price,
        };

        if (tokenData.contractAddress) {
          return new Erc20Token({
            contract: tokenData.contractAddress,
            ...tokenOptions,
          });
        } else {
          return new UnknownToken(tokenOptions);
        }
      });
    } catch (error) {
      throw new Error(`Could not fetch tokens, ${error}`);
    }
  }

  public async getTradePreview(
    _chain: string,
    fromToken: BaseToken,
    toToken: BaseToken
  ): Promise<TradePreview | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT);

      const res = await fetch(`${HOST_URL}`, {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: uuidv4(),
          jsonrpc: "2.0",
          method: "getFixRate",
          params: [
            {
              from: fromToken.symbol.toLowerCase(),
              to: toToken.symbol.toLowerCase(),
            },
          ],
        }),
      });

      clearTimeout(timeoutId);

      const data: { result: [ChangellyFixedRateResponse] } = await res.json();
      const result = data.result[0];
      return {
        min: result.minFrom,
        max: result.maxFrom,
        rates: [
          {
            amount: "1",
            rate: result.result,
          },
        ],
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async getMinMaxAmount(
    fromToken: BaseToken,
    toToken: BaseToken
  ): Promise<{ min: string; max: string }> {
    const res = await fetch(`${HOST_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: uuidv4(),
        jsonrpc: "2.0",
        method: "getFixRate",
        params: [
          {
            from: fromToken.symbol.toLowerCase(),
            to: toToken.symbol.toLowerCase(),
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error("Could not get min max");
    }

    const data = await res.json();
    console.log(data);
    return {
      min: data.result[0].minFrom,
      max: data.result[0].maxFrom,
    };
  }

  public async getQuote(
    chain: string,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<QuoteInfo[]> {
    try {
      const minmax = await this.getMinMaxAmount(fromToken, toToken);
      if (!minmax || (minmax && (!minmax.min || !minmax.max))) {
        return [];
      }

      const res = await fetch(`${HOST_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: uuidv4(),
          jsonrpc: "2.0",
          method: "getFixRateForAmount",
          params: [
            {
              from: fromToken.symbol.toLowerCase(),
              to: toToken.symbol.toLowerCase(),
              amountFrom: fromAmount,
            },
          ],
        }),
      });

      if (!res.ok) {
        console.error(res.status, res.statusText);
        throw new Error("Could not get quote");
      }

      const data = await res.json();

      console.log("getQuote", data);

      return [
        {
          exchange: "changelly",
          dex: "CHANGELLY",
          min: minmax!.min,
          max: minmax!.max,
          amount: data.result[0].result === 0 ? "0" : data.result[0].amountTo,
          rateId: data.result[0].result === 0 ? "" : data.result[0].id,
        },
      ];
    } catch (error) {
      console.error("Failed to retrieve quote", error);
      return [];
    }
  }

  public async getTrade(
    chain: string,
    fromAddress: string,
    toAddress: string,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<TradeInfo[]> {
    try {
      const quote = (
        await this.getQuote(chain, fromToken, toToken, fromAmount)
      ).at(0);

      if (quote) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, REQUEST_TIMEOUT);

        const res = await fetch(`${HOST_URL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: uuidv4(),
            jsonrpc: "2.0",
            method: "createFixTransaction",
            params: {
              from: fromToken.symbol.toLowerCase(),
              to: toToken.symbol.toLowerCase(),
              refundAddress: fromAddress,
              address: toAddress,
              amountFrom: fromAmount,
              rateId: quote.rateId!,
            },
          }),
        });

        clearTimeout(timeoutId);

        const data = await res.json();

        const result: ChangellyTrade = data.result;

        // Request had an error
        if (!result.amountExpectedTo) {
          throw new Error("Unexpected Changelly response");
        }

        let txData: TransactionInfo;

        if (chain === "DOT" || chain === "KSM") {
          const network = getNetworkByName(chain);

          if (!network) throw new Error(`Could not retrieve network ${chain}`);

          const api = await network.api();
          await api.init();

          const toAmountRaw = toBase(fromAmount, fromToken.decimals);
          const tx = await (fromToken as SubstrateToken).send(
            api.api as ApiPromise,
            result.payinAddress,
            toAmountRaw,
            {
              type: "keepAlive",
            }
          );

          txData = {
            to: result.payinAddress,
            from: fromAddress,
            data: tx.toHex(),
            value: "0x",
            gas: "0x",
          };
        } else {
          if (fromToken.symbol.toLowerCase() === chain.toLowerCase()) {
            txData = {
              to: result.payinAddress,
              from: fromAddress,
              data: "0x",
              value: `0x${
                toBN(toBase(fromAmount, fromToken.decimals)).toString(
                  "hex"
                ) as `0x${string}`
              }`,
              gas: "0x",
            };
          } else {
            // TODO ERC20 Transaction
          }
        }

        return [
          {
            provider: "CHANGELLY",
            minimumReceived: result.amountExpectedTo,
            fromAmount: fromAmount,
            fee: "0.025",
            gas: "0x",
            txs: [txData!],
          },
        ];
      } else {
        return [];
      }
    } catch (error) {
      console.error("Failed to get trade:", error);
      return [];
    }
  }

  public getStatus(): TradeStatus {
    // TODO get trade status for activity tab
    return TradeStatus.UNKNOWN;
  }

  public async executeTrade(
    network: BaseNetwork,
    fromAccount: EnkryptAccount,
    trade: TradeInfo
  ): Promise<`0x${string}`[]> {
    const api = await (network as EvmNetwork).api();

    if (network.name === "DOT" || network.name === "KSM") {
      const apiPromise = api.api as ApiPromise;

      const tx = apiPromise.tx(trade.txs[0].data);

      try {
        const signedTx = await tx.signAsync(fromAccount.address, {
          signer: {
            signPayload: (signPayload): Promise<SignerResult> => {
              const registry = new TypeRegistry();
              registry.setSignedExtensions(signPayload.signedExtensions);
              const extType = registry.createType(
                "ExtrinsicPayload",
                signPayload,
                {
                  version: signPayload.version,
                }
              );
              return SubstrateTransactionSigner({
                account: fromAccount,
                network: network,
                payload: extType,
              }).then((res) => {
                if (res.error) return Promise.reject(res.error);
                else
                  return {
                    id: 0,
                    signature: JSON.parse(res.result as string),
                  };
              });
            },
          },
        });

        const hash = await signedTx.send();
        console.log("tx hash", u8aToHex(hash));
        return [u8aToHex(hash)];
      } catch (error) {
        console.error("error", error);
        return ["0x"];
      }
    } else {
      await api.init();
      const web3 = (api as EvmAPI).web3;

      const { data, value, to } = trade.txs[0];

      const tx = new Transaction(
        {
          from: fromAccount.address as `0x${string}`,
          to: to as `0x${string}`,
          data,
          value,
          chainId: numberToHex((network as EvmNetwork).chainID) as `0x{string}`,
        },
        web3
      );

      return tx
        .getFinalizedTransaction({ gasPriceType: GasPriceTypes.ECONOMY })
        .then((finalizedTx) =>
          EvmTransactionSigner({
            account: fromAccount,
            network: network,
            payload: finalizedTx,
          }).then((signedTx) =>
            web3.eth
              .sendSignedTransaction(
                `0x${signedTx.serialize().toString("hex")}`
              )
              .on("transactionHash", (hash: string) => {
                console.log("hash", hash);
              })
              .then((receipt) => [receipt.transactionHash] as `0x${string}`[])
          )
        );
    }
  }
}
