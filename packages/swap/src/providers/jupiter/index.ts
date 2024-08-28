import { NetworkNames } from "@enkryptcom/types";
import { Connection, VersionedTransaction, PublicKey, } from "@solana/web3.js";
import { DEFAULT_SLIPPAGE, FEE_CONFIGS, NATIVE_TOKEN_ADDRESS, SwapFeeConfig } from "@src/configs";
import {
  ProviderClass,
  ProviderName,
  TokenType,
  SupportedNetworkName,
  ProviderFromTokenResponse,
  ProviderToTokenResponse,
  ProviderSwapResponse,
  SwapQuote,
  StatusOptions,
  TransactionStatus,
  getQuoteOptions,
  ProviderQuoteResponse,
  QuoteMetaOptions,
  TransactionType,
  StatusOptionsResponse,
  SolanaTransaction,
  TokenNetworkType,
} from "@src/types";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "@src/utils/approvals";
import { toBN } from "web3-utils";

/**
 * # Jupiter swap flow
 *
 * @see https://station.jup.ag/docs/APIs/swap-api
 * @see https://station.jup.ag/api-v6/introduction
 * @see https://station.jup.ag/api-v6/get-quote
 * @see https://station.jup.ag/api-v6/post-swap
 * @see https://station.jup.ag/guides/jupiter-swap/how-referral-works
 * @see https://referral.jup.ag/
 * @see https://referral.jup.ag/api
 *
 * Jupiter requires you to create a referral account. You can do this by
 * visiting the Jupiter referral dashboard https://referral.jup.ag/dashboard
 * and selecting "create account".
 *
 * After you have a referral account (associated with a Solana address) you
 * need to create token accounts for it so that it can receive referral fees
 * for those tokens. This is also done via the Jupiter referral dashboard
 * https://referral.jup.ag/dashboard.
 *
 * ## Steps
 *
 *   1. Request a quote from the Jupiter swap API
 * 2. Request a swap transaction from the Jupiter swap API with the quote provided
 * 3. Deserialize and signt he transaction
 * 4. Execute the transaction
 *
 * ## Extra notes
 *
 * "Mint" is the address of a token.
 *
 * [Solana 101](https://2501babe.github.io/posts/solana101.html)
 */
  
 **
 * ? Wrapped SOL address ?
 * @see https://solscan.io/token/So11111111111111111111111111111111111111112
 */
        
  nst WRAPPED_SOL_ADDRESS = "So11111111111111111111111111111111111111112"
  nst NATIVE_SOL_ADDRESS = "So11111111111111111111111111111111111111111"

/**
 * Trim a string to (close to) the desired length and if trimmed, then
 * put the cut length at the end
 *
 * @example
 * ```ts
 * shorten('hello world!!', 10) // 'hello world!!'
 * shorten('hello world!!', 5)  // 'hello world!!'
 * shorten('hello world!!', 3)  // 'hel... (3/13)'
 * shorten('hello world!!', 2)  // 'he... (2/13)'
 * shorten('hello world!!', 1)  // 'h... (1/13)'
 * ````
 *
 */
function shorten(string: string, max: number): string {
    t short = string;
  const len = short.length;
  if (len > max + 7 + max.toString().length + len.toString().length) {
    short =  `${short. sli ce(0, max)}... (${max } /${l e n})`;
  } 
  return short;
 
   

* curl -sL https://tokens.jup.ag/tokens?tags=verified | jq -C | less -N */
  nst JUPITER_TOKENS_URL = "https://tokens.jup.ag/tokens?tags=verified";
  
n  JUPITER_API_URL = "https://quote-api.jup.ag/v6/";

    erTokenInfo = {
address: string;
name: string;
symbol: string;
decimals: string;
    
  
 Terminology: 
 "Mint" is an address of a token


*
  see https://station.jup.ag/api-v 6/get-quote
     
    ample
    sh
    l -sL -H 'Accept: application/json' 'https://quote-api.jup.ag/v6/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=5'
    
            
    iterQuoteResponse = {       
    @example "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" */
    tMint: string;
    @example "5" */
    ount: string;
    @example "So11111111111111111111111111111111111111112" */
    utMint: string;
    @example "35" */
    mount: string;
    @example "35" */
  herAmountThreshold: string;
  * @example "ExactIn" */
  apMode: string;
/ ** @example 50 */
slippageBps: number;
/** TODO: @example null */
platformFee: null;
/** @example "0" */
  priceImpactPct: string;
  routePlan: {
    swapInfo: {
      /** @example "5URw47pYHN9heEQFKtUFeHzTskHwN78bBvKefV5C98fe" */
      ammKey: string;
      /** @example "Oasis" */
      label: string;
      /** @example "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" */
      inputMint: string;
      /** @example "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" */
    outputMint:  string;
    /** @example  "5" */
    inAmount: string;
    /** @e xample "28679" */
    outAmount: string;
    /** @exampl e "115" */
    feeAmount: string;
    /** @example "DezXAZ8z7Pn rnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" */
    feeMint: string; 
  };
  /** @example 100  */
  percent: number;
}[]; 
/** @example 284606533 */
contextSlot: number; 
/** @example 0.743937514 */
 imeTaken: number;
 
 
 
 @see https://station.jup.ag/api-v6/post-swap
 
 @example
 ```sh 
 curl -sL -X POST -H 'Accept: application/json' -H 'Content-Type: application/json' 'https://quote-api.jup.ag/v6/swap' -d ...
 ```
 */
type JupiterSwapParams = {
  userPublicKey: string;
  /** Default: true */
  wrapAndUnwrapSol?: boolean;
  useSharedAccounts?: boolean;
  /** Referral address */
  feeAccount?: string;
  /** Public key used to track transactions */
  trackingAccount?: string;
  /** Integer */
  computeUnitPriceMicroLamports?: number;
  prioritizationFeeLamports?: number;
  /** Default: false */
  as : boolean;
  * * Default: false */
  useTokenLedger?: boolean;
  /** Public key of key of token receiver
  . Default: user's ATA. */
  destinationTokenAccount?: string;
  /**
   * Simulate the swap to get the compute units (like gas in the EVM) &
   set in ComputeBudget's compute unit limit.
   *
   * Default: false
   */
  dynamicComputeUnitLimit?: boolean; 
  /** Do not do RPC calls to check on user's account. Default: false. */
  ipUserAccountRpcCalls ?: boolean;
  * Response from the Jupiter API quote endpoint */   
  quoteResponse: JupiterQuoteResponse;
};
  
  e JupiterSwapResponse = { 
  swapTransaction: string;
  lastValidBlockHeight: numbe 
  prioritizationFeeLamports?: number;
  
  

nction isValidSolanaAddress(address:  string): Promise<boolean> {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(address)
   return Promise.resolve(true)
  catch (err) {
  return Promise.resolve(false)
          

      
  
*  
     Jupiter is a DEX on Solana
      
      - App: https://jup.ag/
 * - Documentation: https://station.jup.ag/docs/
       - Token lists: ttps://station.jup.ag/docs/token-list
         - https://token s .jup.ag/tokens?tags=verified
   
    ss Jupiter extends ProviderClass {
  network: SupportedNetworkName;  

  
  name = ProviderName.jupiter;

  : Connection;

    /** Initialised in `init` */
    okens: ProviderFromTokenResponse;
  
    itialised in `init` */
    ns: ProviderToTokenResponse;
  
  Initialised in `init` address -> Jupiter token info */
    rTokens: Map<string, JupiterTokenInfo>;
  
nstru ctor(conn: Connection, network: SupportedNetworkName) {
    super();
this.network = network;
this.conn = conn; 
   
        this.fromTokens = {};
this.toTokens = {};
this.jupiterTokens = new Map();
      } 
    
      
   * Initialise `fromTokens` and `toTokens`
      
@param enkryptTokenList Tokens with prices, from swaplists on `https://github.com/enkryptcom/dynamic-data`
                  `curl -sL https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/SOLANA.json | jq -C | less -N`
        
        c init(enkryptTokenList : TokenType[]): Promise<void> {
         Only supports Solana
         ((this.network as unknown as str ing )  ! = = Ne t workNames.Slana) return;
           
          oad supported verified tok ens from the Jupiter API
     
    t res = await fetc h(JUPITER_TOKENS_URL, {
    gnal: AbortSignal.timeout(30_000),
  ;
          
         (!res.ok) {
      const msg = await res
          .text()
        .catch((err) => `Failed to parse response text: ${String(err)}`);
      const shortMsg = shorten(msg, 512);
        throw new Error( 
            `Failed to fetch Jupiter tokens. HTTP request returned not-ok status ${res.status}, ${res.statusText}: ${shortMsg}`
      );
         
            

            st of Jupiter tokens */
            jupiterTokenList = (await res.json()) as JupiterTokenInfo[];
    
           Inner join jupiter tokens with our tokens from `https://github.com/enkryptcom/dynamic-data`
        // and save the results
        
          /** Mapping of cased token address -> Jupiter token info */
        this.jupiterTokens = new Map(jupiterTokenLi st.map((t) => [t.address, t]));
         
  /** Intersection of token list & jupiter tokens */
            this.toTokens[this.network] ??= {} 
  for (let i = 0, len = enkryptTokenList.length; i < len; i++) {
    // TODO: handle native address
    const enkryptToken = enkryptTokenList[i];
      let isTradeable = false; 
             if (enkryptToken.address === NATIVE_TOKEN_ADDRESS) {
         // Jupiter swap API auto unwraps SOL (it's configurable)
        // Jupiter doesn't send bak nativ e sol   
      // TODO: does jupiter let us trade native SOL? what does the transaction look like?
            // would we send them native SOL?          
      isTr a deable = this.jupiterTokens.has(WRAPPED_SOL_ADDRESS)
              } else { 
      isTradeable = this.jupiterTokens.has(enkryptToken.address);
            } 
          
            // Not supported         
     if (!isTradeable) continue;
  
      // Token is supported on Jupiter
    this.f romTokens[enkryptToken.address] = enkryptToken;       
    this.toTokens[this.network][enkryptToken.address] = {
        ...enkryptToken,
     networkInfo: {
          name: SupportedNetworkName.Solana,
          isAddress: isValidSolanaAddress,
      } satisfies TokenNetworkType
    }
    }
     

  romTokens(): ProviderFromTokenResponse {
return this.fromTokens;
  }

tToTokens(): ProviderToTokenResponse {
return this.toTokens;
     

  
 Get a quote and swap prepare a swap transactin for the assets         
   */
ivate async querySwapInfo(
options: getQuoteOptions,
meta: QuoteMetaOptions
 Promise<{
jupiterQuote: JupiterQuoteResponse;
jupiterSwap: JupiterSwapResponse;
  se64SwapTransaction: string;
   feeConf: SwapFeeConfig;
  ePercentage: number,
  
const feeConf = FEE_CONFIGS[this.name][meta.walletIdentifier];

// NOTE: we let Jupiter automatically wrap and unwrap SOL so it appears to the user
// as if they can swap their native SOL

if (!feeConf)
  throw new Error("Something went wrong: no fee config for Jupiter swap");

    /** Address of the source token. For native SOL we use the wrapped SOL address */
let fromTokenAddress: string = options.fromToken.address
if (options.fromToken.address === NATIVE_TOKEN_ADDRESS) {
  fromTokenAddress = WRAPPED_SOL_ADDRESS
} else {
  fromTokenAddress = options.fromToken.address
  

  * Address of the destination token. For native SOL we use the wrapped SOL address */
            t toTokenAddress: stri
            ng = options.toToken.address
               (options.toToken.address == = NATIVE_TOKEN_ADDRESS) {
  toTokenAddress = WRAPPED_SOL_ADDRESS
} else {
                 toTokenAddress = options.toToken.address
            
            
 Get the SPL address of the account that will receive your fees
            the SPL address is owned by the referrer program which gives you
                // the ability to claim (withdraw) your assets
               The address is specified in the swap documentation
 https://station.jup.ag/api-v6/post-swap in the `feeAccount` section
              st referrerAccountSeeds = [
                Buffer.from("referral_ata"),
                // Your referrer address that the Jupiter referral program gave you
  new PublicKey(feeConf.referrer).toBuffer(),
              new PublicKey(fromTokenAddress).toBuffer(),
                ];
const referrerProgramId = new PublicKey("REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3");
    const [feeAccountPukey] = await PublicKey.findProgramAddress(referrerAccountSeeds, referrerProgramId);
/** SPL account address, owned by the Jupiter referral program, that holds our referral fees */

    // Check if the address exists / has been created
// if not then we can't use it to receive fees
  nst referralAccountInfo = await this.conn.getAccountInfo(feeAccountPukey);
  
// TODO: does the account get created for us automatically?
    let feeAcountAddress: string | undefined
let feeBps: number
   (referralAccountInfo != null) {
    eAcountAddress = feeAccountPukey.toBase58();
    eBps = Math.round(100 * feeConf.fee);
  else {
  // If this happens you should go to the Jupiter referral console and create an account
     for this asset
  console.warn(`Enkrypt Jupiter referral fee account ${feeAcountAddress} doesn't exist yet. You'll need to create it to receive referral fees for token type ${fromTokenAddress}.`);
  feeBps = 0
    }

    // Get a quote for the swap pair

/** @see https://station.jup.ag/api-v6/get-quote */
  nst quoteParams: [key: string, value: string][] = [];
  
  oteParams.push(["inputMint", fromTokenAddress]);
quoteParams.push(["outputMint", toTokenAddress]);
    quoteParams.push(["amount", options.amount.toString(10)]);
quoteParams.push(["slippageBps", Math.round(100 * parseFloat(meta.slippage || DEFAULT_SLIPPAGE)).toString()]);
if (feeAcountAddress != null) quoteParams.push(["platformFeeBps", feeBps.toString()]);
    // Note: using ExactIn also implies the referral fee is in source tokens
quoteParams.push(["swapMode", "ExactIn"]);
  
  nst quoteQuery = new URLSearchParams(quoteParams);
  
  * @see https://station.jup.ag/api-v6/get-quote */
    t quoteUrl = `${JUPITER_API_URL}quote?${quoteQuery.toString()}`;
    
  nst quoteRes = await fetch(quoteUrl, {
  signal: AbortSignal.timeout(30_000),
      headers: [["Accept", "application/json"]],
});
  
    !quoteRes.ok) {
    nst msg = await quoteRes
    .text()
    .catch((err) => `Failed to parse response text: ${String(err)}`);
    nst shortMsg = shorten(msg, 512);
  throw new Error(
    `Failed to get a Jupiter swap quote. HTTP request returned not-ok status ${quoteRes.status}, ${quoteRes.statusText}: ${shortMsg}`
      );
}

const quote = (await quoteRes.json()) as JupiterQuoteResponse;
  
   Get a swap transaction based on the quote
  nst swapParams: JupiterSwapParams = {
  userPublicKey: options.fromAddress,
  feeAccount: feeAcountAddress,
      quoteResponse: quote,
    };

  /** @see https://station.jup.ag/api-v6/post-swap */
  const swapUrl = `${JUPITER_API_URL}swap`;
 
  const swapRes = await fetch(swapUrl, {
    method: "POST",
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify(swapParams),
      headers: [
      ["Content-Type", "application/json"],
      ["Accept", "application/json"],
    ],
  });
  
    if (!swapRes.ok) {
    const msg = await swapRes
      .text()
      .catch((err) => `Failed to parse response text: ${String(err)}`);
    const shortMsg = shorten(msg, 512);
    throw new Error(
      `Failed to get Jupiter swap transaction. HTTP request returned not-ok status ${swapRes.status}, ${swapRes.statusText}: ${shortMsg}`
    );
    
    
    nst swap = (await swapRes.json()) as JupiterSwapResponse;
    
    turn {
    feePercentage: feeBps / 100,
    jupiterSwap: swap,
    jupiterQuote: quote,
      se64SwapTransaction: swap.swapTransaction,
      
      
    
    c getQuote(
      ons: getQuoteOptions,
      : QuoteMetaOptions
      mise<null | ProviderQuoteResponse> {
      t { jupiterQuote, } = await this.querySwapInfo(
      tions,
    meta
  );

  // Jupiter swaps have four different kinds of fees:
  // 1. Transaction base fees: number of signatures * lamports per signature
    // 2. Transaction priority fees (sometimes): set via the Compute Budget program's "SetComputeUnitPrice"
    // 3. Transaction referral fees: fees  p aid to MEW as the wa llet provider
  // 4. The swap provider, Jupiter, probably takes a fee (I think 2.5%? IIRC documented somewhere)
    
    nst result: ProviderQuoteResponse = {
    fromTokenAmount: toBN(jupiterQuote.inAmount),
    toTokenAmount: toBN(jupiterQuote.outAmount),
      // Solana doesn't have the concept of a gas limit
    // it does have something kind-of similar to gas though, but base fees aren't changed based
    // on it, only priority fees
    // Base fees are charged on signature count (number of accounts possibly touched in transaction,
    // usually 5,000 Lamports per signature I think)
    // (unitsConsumed is kind-of like gas)
    totalGaslimit: 0,
      // TODO: do we set additionalNativeFees to the priority fee, or leave it 0?
    // additionalNativeFees: toBN(jupiterSwap.prioritizationFeeLamports ?? 0),
    additionalNativeFees: toBN(0),
    provider: this.name,
    quote: {
      options,
      meta,
      provider: this.name,
    },
    minMax: {
      // TODO: how do I get these limits
      minimumFrom: toBN("1"),
      maximumFrom: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
      minimumTo: toBN("1"),
      maximumTo: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
      
    
  
    return result;
  

  async getSwap(quote: SwapQuote): Promise<ProviderSwapResponse> {
    const {   
    eePercentage,
  jupiterQuote,
    se64SwapTransaction,
  = await this.querySwapInfo(quote.options, quote.meta);

const enkryptTransaction: SolanaTransaction = {
  from: quote.options.fromAddress,
  to: quote.options.toAddress,
  serialized: base64SwapTransaction,
      type: TransactionType.solana,
};
  
  nst result: ProviderSwapResponse = {
  transactions: [enkryptTransaction],
      fromTokenAmount: toBN(jupiterQuote.inAmount),
  toTokenAmount: toBN(jupiterQuote.outAmount),
  // TODO: do we set additionalNativeFees to the priority fee, or leave it 0?
  // additionalNativeFees: toBN(jupiterSwap.prioritizationFeeLamports ?? 0),
  additionalNativeFees: toBN(0),
      provider: this.name,
  slippage: quote.meta.slippage,
  fee: feePercentage, // feeConf.fee * 100,
  getStatusObject: async (
    options: StatusOptions
      ): Promise<StatusOptionsResponse> => ({
    options,
        provider: this.name,
      }),
    };

    return result;
  }

  async getStatus(options: StatusOptions): Promise<TransactionStatus> {
    if (options.transactionHashes.length !== 1) {
      throw new TypeError(
        `JupiterSwap.getStatus: Expected one transaction hash but got ${options.transactionHashes.length}`
      );
    }
    const [txhash] = options.transactionHashes;
    const txResponse = await this.conn.getTransaction(txhash, {
      maxSupportedTransactionVersion: 0,
    });

    if (txResponse == null) {
      // Transaction hasn't been picked up by the node yet
      return TransactionStatus.pending;
    }

    if (txResponse.meta == null) {
      // TODO: verify that `ConfirmedTransactionMeta` == null means pending
      return TransactionStatus.pending;
    }

    if (txResponse.meta.err != null) {
      // TODO: verify that `err` != null means failed
      return TransactionStatus.failed;
    }

    return TransactionStatus.success;
  }
}

