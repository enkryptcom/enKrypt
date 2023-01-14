import { Erc20Token } from "@/providers/ethereum/types/erc20-token";
import { BaseToken } from "@/types/base-token";
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
import { toBN } from "web3-utils";
import { BaseNetwork } from "@/types/base-network";
import { EnkryptAccount, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import Transaction from "@/providers/ethereum/libs/transaction";
import { GasPriceTypes } from "@/providers/common/types";
import { TransactionSigner as SubstrateTransactionSigner } from "@/providers/polkadot/ui/libs/signer";
import { TransactionSigner as EvmTransactionSigner } from "@/providers/ethereum/ui/libs/signer";
import { getNetworkByName } from "@/libs/utils/networks";
import { ApiPromise } from "@polkadot/api";
import { SubstrateToken } from "@/providers/polkadot/types/substrate-token";
import { TypeRegistry } from "@polkadot/types";
import type { SignerResult } from "@polkadot/api/types";
import { u8aToHex } from "@polkadot/util";
import Web3Eth from "web3-eth";
import erc20 from "@/providers/ethereum/libs/abi/erc20";
import ActivityState from "@/libs/activity-state";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { ChangellyToken, ChangellyTokenOptions } from "./changelly-token";
import BigNumber from "bignumber.js";
import broadcastTx from "@/providers/ethereum/libs/tx-broadcaster";

const CHANGELLY_TOKEN_INFO = [
  {
    id: "eth",
    icon: require("../assets/eth.svg"),
    coingeckoID: "ethereum",
  },
  {
    id: "dot",
    icon: require("../assets/polkadot.svg"),
    coingeckoID: "polkadot",
  },
  {
    id: "ksm",
    icon: require("../assets/kusama.svg"),
    coingeckoID: "kusama",
  },
  {
    id: "maticpolygon",
    icon: require("../assets/matic.svg"),
    coingeckoID: "polygon",
  },
  {
    id: "btc",
    icon: require("../assets/bitcoin.svg"),
    coingeckoID: "bitcoin",
  },
  {
    id: "bnbbsc",
    icon: require("../assets/bnb.webp"),
    coingeckoID: "binancecoin",
  },
];

interface ChangellyTokenInfo {
  contractAddress?: string;
  fullName: string;
  name: string;
  ticker: string;
  fixRateEnabled: boolean;
  coingeckoID?: string;
  image: string;
  price?: string;
  blockchain: string;
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

const activityState = new ActivityState();

export class ChangellySwapProvider extends SwapProvider {
  public supportedNetworks: NetworkNames[] = [
    NetworkNames.Kusama,
    NetworkNames.Polkadot,
    NetworkNames.Ethereum,
    NetworkNames.Binance,
    NetworkNames.Matic,
    NetworkNames.Bitcoin,
  ];
  public supportedDexes = ["CHANGELLY"];
  supportedTokens: string[] = [
    "KSM",
    "DOT",
    "ETH",
    "BNB",
    "MATIC",
    "MATICPOLYGON",
    "BTC",
    "BNBBSC",
  ];
  constructor() {
    super();
  }

  public async isValidAddress(
    address: string,
    toToken: BaseToken
  ): Promise<boolean> {
    try {
      const controller = new AbortController();

      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const res = await fetch(`${REQUEST_CACHER}${HOST_URL}`, {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: uuidv4(),
          jsonrpc: "2.0",
          method: "validateAddress",
          params: {
            currency: toToken.symbol,
            address,
          },
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (data.result.result) {
        return data.result.result;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async getSupportedTokens(chain: NetworkNames): Promise<{
    tokens: BaseToken[];
    featured: BaseToken[];
  }> {
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
        .filter((tokenData) =>
          this.supportedTokens.includes(tokenData.ticker.toUpperCase())
        )
        .filter((tokenData) => tokenData.fixRateEnabled)
        .filter((tokenData) => {
          if (tokenData.ticker.toUpperCase() === chain) {
            return false;
          }

          const token = CHANGELLY_TOKEN_INFO.find(
            (info) => info.id === tokenData.name
          );

          if (token) return true;
          return false;
        })
        .map((tokenData) => {
          const token = CHANGELLY_TOKEN_INFO.find(
            (info) => info.id === tokenData.name
          );

          const coingeckoID = token!.coingeckoID;
          const icon = token!.icon;
          return { coingeckoID, ...tokenData, image: icon };
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
        tokenData.forEach((token) => {
          if (token.coingeckoID === cgid) {
            token.price = prices[cgid]["usd"];
          }
        });
      });

      return {
        tokens: tokenData.map((tokenData) => {
          let name = tokenData.fullName;
          let symbol = tokenData.ticker;

          if (tokenData.name === "matic") {
            name = "Ethereum Polygon";
          } else if (tokenData.name === "maticpolygon") {
            name = "Polygon Mainnet";
            symbol = "MATIC";
          } else if (tokenData.name === "bnbbsc") {
            symbol = "BNB";
          }

          const tokenOptions: ChangellyTokenOptions = {
            name,
            symbol: symbol.toUpperCase(),
            decimals: 0,
            icon: tokenData.image,
            balance: "1",
            price: tokenData.price,
            contract: tokenData.contractAddress,
            blockchain: tokenData.blockchain,
            changellyID: tokenData.ticker,
          };

          return new ChangellyToken(tokenOptions);
        }),
        featured: [],
      };
    } catch (error) {
      throw new Error(`Could not fetch tokens, ${error}`);
    }
  }

  public async getTradePreview(
    _chain: string,
    fromToken: ChangellyToken,
    toToken: ChangellyToken
  ): Promise<TradePreview | null> {
    if (!toToken.changellyID) {
      return null;
    }

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
              to: toToken.changellyID,
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
    return {
      min: data.result[0].minFrom,
      max: data.result[0].maxFrom,
    };
  }

  public async getQuote(
    chain: NetworkNames,
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
    chain: NetworkNames,
    fromAddress: string,
    toAddress: string,
    fromToken: BaseToken,
    toToken: ChangellyToken,
    fromAmount: string,
    swapMax: boolean
  ): Promise<TradeInfo[]> {
    if (!toToken.changellyID) {
      return [];
    }

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
              to: toToken.changellyID,
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
          const network = await getNetworkByName(chain);

          if (!network) throw new Error(`Could not retrieve network ${chain}`);

          const api = await network.api();

          let fromAmountRaw = new BigNumber(
            toBase(fromAmount, fromToken.decimals)
          );

          if (swapMax) {
            const txEstimate = await (
              await (fromToken as SubstrateToken).send(
                api.api as ApiPromise,
                result.payinAddress,
                fromAmountRaw.toString(),
                { type: swapMax ? "transfer" : "keepAlive" }
              )
            ).paymentInfo(fromAddress);

            const fee = new BigNumber(txEstimate.partialFee.toString());

            fromAmountRaw = fromAmountRaw.minus(fee);
          }

          const tx = await (fromToken as SubstrateToken).send(
            api.api as ApiPromise,
            result.payinAddress,
            fromAmountRaw.toString(),
            { type: swapMax ? "transfer" : "keepAlive" }
          );

          const gas = (await tx.paymentInfo(fromAddress)).partialFee.toHex();

          txData = {
            tokenValue: fromAmount,
            token: {
              name: fromToken.name,
              symbol: fromToken.symbol,
              decimals: fromToken.decimals,
              coingeckoID: fromToken.coingeckoID,
              icon: `https://img.mewapi.io/?image=${fromToken.icon}`,
            },
            to: result.payinAddress,
            from: fromAddress,
            data: tx.toHex(),
            value: "0x",
            gas,
          };
        } else {
          if (fromToken.symbol.toLowerCase() === chain.toLowerCase()) {
            txData = {
              tokenValue: fromAmount,
              token: {
                name: fromToken.name,
                symbol: fromToken.symbol,
                decimals: fromToken.decimals,
                coingeckoID: fromToken.coingeckoID,
                icon: `https://img.mewapi.io/?image=${fromToken.icon}`,
              },
              to: result.payinAddress,
              from: fromAddress,
              data: "0x",
              value: `0x${
                toBN(toBase(fromAmount, fromToken.decimals)).toString(
                  "hex"
                ) as `0x${string}`
              }`,
            };
          } else {
            const network = await getNetworkByName(chain);
            const web3 = new Web3Eth(network!.node);
            const tokenContract = new web3.Contract(
              erc20 as any,
              (fromToken as Erc20Token).contract
            );

            let amountToSwap = toBase(fromAmount, fromToken.decimals);

            if (swapMax) {
              amountToSwap = (
                await tokenContract.methods.balanceOf(fromAddress)
              ).toString();
            }

            const data = tokenContract.methods
              .transfer(result.payinAddress, amountToSwap)
              .encodeABI();

            txData = {
              to: (fromToken as Erc20Token).contract,
              from: fromAddress,
              data,
              value: "0x0",
              tokenValue: fromAmount,
              token: {
                name: fromToken.name,
                symbol: fromToken.symbol,
                decimals: fromToken.decimals,
                coingeckoID: fromToken.coingeckoID,
                icon: `https://img.mewapi.io/?image=${fromToken.icon}`,
              },
            };
          }
        }

        return [
          {
            provider: "CHANGELLY",
            minimumReceived: result.amountExpectedTo,
            fromAmount: fromAmount,
            fee: "0.025",
            gas: "0x",
            rateId: result.id,
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
    trade: TradeInfo,
    gasPriceType?: GasPriceTypes
  ): Promise<`0x${string}`[]> {
    const api = await (network as EvmNetwork).api();

    if (
      network.name === NetworkNames.Polkadot ||
      network.name === NetworkNames.Kusama
    ) {
      const apiPromise = api.api as ApiPromise;

      const { to, from, token, data, tokenValue } = trade.txs[0];

      const tx = apiPromise.tx(data);

      const txActivity: Activity = {
        from: network.displayAddress(from),
        to,
        token,
        isIncoming: fromAccount.address === trade.txs[0].to,
        network: network.name,
        status: ActivityStatus.pending,
        timestamp: new Date().getTime(),
        type: ActivityType.transaction,
        value: toBase(tokenValue, token.decimals),
        swapId: trade.rateId,
        transactionHash: "",
      };

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
        await activityState.addActivities(
          [
            {
              ...JSON.parse(JSON.stringify(txActivity)),
              ...{ transactionHash: hash },
            },
          ],
          { address: fromAccount.address, network: network.name }
        );
        return [u8aToHex(hash)];
      } catch (error) {
        console.error("error", error);
        return ["0x"];
      }
    } else {
      const web3 = (api as EvmAPI).web3;
      web3.handleRevert = true;

      const { data, value, to, from, tokenValue, token } = trade.txs[0];

      const tx = new Transaction(
        {
          from: fromAccount.address as `0x${string}`,
          to: to as `0x${string}`,
          data,
          value,
          chainId: (network as EvmNetwork).chainID,
        },
        web3
      );

      const txActivity: Activity = {
        from,
        to,
        token,
        isIncoming: fromAccount.address === to,
        network: network.name,
        status: ActivityStatus.pending,
        timestamp: new Date().getTime(),
        type: ActivityType.transaction,
        value: toBase(tokenValue, token.decimals),
        swapId: trade.rateId,
        transactionHash: "",
      };

      return tx
        .getFinalizedTransaction({
          gasPriceType: gasPriceType ?? GasPriceTypes.REGULAR,
        })
        .then((finalizedTx) =>
          EvmTransactionSigner({
            account: fromAccount,
            network: network,
            payload: finalizedTx,
          }).then((signedTx) => {
            return new Promise((resolve) => {
              const onHash = (hash: string) => {
                activityState.addActivities(
                  [
                    {
                      ...JSON.parse(JSON.stringify(txActivity)),
                      ...{ transactionHash: hash },
                    },
                  ],
                  { address: fromAccount.address, network: network.name }
                );
                resolve([hash] as `0x${string}`[]);
              };
              broadcastTx(
                `0x${signedTx.serialize().toString("hex")}`,
                network.name
              )
                .then(onHash)
                .catch(() => {
                  web3
                    .sendSignedTransaction(
                      `0x${signedTx.serialize().toString("hex")}`
                    )
                    .on("transactionHash", onHash);
                });
            });
          })
        );
    }
  }
}
