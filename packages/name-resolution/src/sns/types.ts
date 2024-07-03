import { SupportedChains, SNS } from "@bonfida/sns-warp-evm";

type SupportedNetwork = "BASE" | "BNB";

export interface SNSOptions {
    network: "testnet" | "mainnet";
}

export type ChainMap = Record<SupportedNetwork, SupportedChains>;

export type Resolvers = Record<string, SNS>;
