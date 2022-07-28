import { Erc20Token } from "../../types/erc20-token";

export const tokens: Erc20Token[] = [
  new Erc20Token({
    name: "Kusama",
    symbol: "xcKSM",
    icon: "https://moonriver.moonscan.io/token/images/xckusama_32.png",
    coingeckoID: "kusama",
    contract: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080",
    decimals: 12,
  }),
  new Erc20Token({
    name: "Karura",
    symbol: "xcKAR",
    icon: "https://moonriver.moonscan.io/token/images/karura_32.png",
    contract: "0xFfFFFFfF08220AD2E6e157f26eD8bD22A336A0A5",
    decimals: 12,
  }),
  new Erc20Token({
    name: "Acala Dollar",
    symbol: "xcAUSD",
    icon: "https://moonriver.moonscan.io/token/images/acala-usd_32.png",
    contract: "0xFfFffFFfa1B026a00FbAA67c86D5d1d5BF8D8228",
    decimals: 12,
  }),
  new Erc20Token({
    name: "RMRK",
    symbol: "xcRMRK",
    icon: "https://moonriver.moonscan.io/token/images/rmrk_32.png",
    contract: "0xffffffFF893264794d9d57E1E0E21E0042aF5A0A",
    decimals: 10,
  }),
  new Erc20Token({
    name: "Tether USD",
    symbol: "xcRMRK",
    icon: "https://moonriver.moonscan.io/token/images/usdt_32.png",
    contract: "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d",
    decimals: 10,
  }),
];
