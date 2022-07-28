import { Erc20Token } from "../../types/erc20-token";

export const tokens: Erc20Token[] = [
  new Erc20Token({
    name: "Polkadot",
    symbol: "xcDOT",
    icon: "https://polkadot.network/assets/img/brand/Polkadot_Token_PolkadotToken_Pink.svg?v=b5a917b142",
    coingeckoID: "polkadot",
    contract: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080",
    decimals: 10,
  }),
  new Erc20Token({
    name: "Acala",
    symbol: "xcACA",
    icon: "https://acala.network/static/media/Acala%20Gradient.e027e8c0.svg",
    coingeckoID: "acala",
    contract: "0xffffFFffa922Fef94566104a6e5A35a4fCDDAA9f",
    decimals: 12,
  }),
  new Erc20Token({
    name: "Acala Dollar",
    symbol: "xcaUSD",
    icon: "https://acala.network/static/media/aUSD.aacc6a99.svg",
    coingeckoID: "usd-coin",
    contract: "0xfFfFFFFF52C56A9257bB97f4B2b6F7B2D624ecda",
    decimals: 12,
  }),
  new Erc20Token({
    name: "Wrapped GLMR",
    symbol: "WGLMR",
    icon: "https://moonscan.io/token/images/wrappedglmr_32.png?v=2",
    coingeckoID: "moonbeam",
    contract: "0xAcc15dC74880C9944775448304B263D191c6077F",
    decimals: 18,
  }),
  new Erc20Token({
    name: "Beamswap Token",
    symbol: "GLINT",
    icon: "https://moonscan.io/token/images/beamswap_32.png",
    contract: "0xcd3B51D98478D53F4515A306bE565c6EebeF1D58",
    decimals: 18,
  }),
  new Erc20Token({
    name: "USD Coin",
    symbol: "USDC",
    icon: "https://moonscan.io/token/images/centre-usdc_28.png",
    contract: "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
    decimals: 6,
  }),
  new Erc20Token({
    name: "StellaSwap",
    symbol: "STELLA",
    icon: "https://moonscan.io/token/images/stellaswap_32.png",
    contract: "0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2",
    decimals: 18,
  }),
];
