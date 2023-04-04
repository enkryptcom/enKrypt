import {
  CoinGeckoToken,
  CoinGeckoTokenMarket,
  CoingeckPlatforms,
} from "./types";

interface getCoinGeckoTokenInfoAllType {
  data: {
    getCoinGeckoTokenInfoAll: {
      id: string;
      symbol: string;
      name: string;
      platforms: {
        platform: string;
        address: string;
      }[];
    }[];
  };
}
const ETHVM_BASE = `https://api-v2.ethvm.dev/`;

const ethvmPost = (requestData: string): Promise<any> => {
  return fetch(ETHVM_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: requestData,
  }).then((res) => res.json());
};

export const getAllPlatformData = (): Promise<CoinGeckoToken[]> => {
  return ethvmPost(
    '{"operationName":null,"variables":{},"query":"{\\n  getCoinGeckoTokenInfoAll {\\n    id\\n    symbol\\n    name\\n    platforms {\\n      platform\\n      address\\n    }\\n  }\\n}\\n"}'
  ).then((json: getCoinGeckoTokenInfoAllType) => {
    const retResponse: CoinGeckoToken[] = [];
    json.data.getCoinGeckoTokenInfoAll.forEach((item) => {
      const { id, name, symbol, platforms } = item;
      const cgPlatforms: CoingeckPlatforms = {};
      platforms.forEach((p) => {
        cgPlatforms[p.platform] = p.address;
      });
      const token: CoinGeckoToken = {
        id,
        name,
        symbol,
        platforms: cgPlatforms,
      };
      retResponse.push(token);
    });
    return retResponse;
  });
};

export const getUSDPriceById = (id: string): Promise<string | null> => {
  return ethvmPost(
    '{"operationName":null,"variables":{},"query":"{\\n  getCoinGeckoTokenMarketDataByIds(coinGeckoTokenIds: [\\"' +
      id +
      '\\"]) {\\n    current_price\\n  }\\n}\\n"}'
  )
    .then((json) => {
      return json.data.getCoinGeckoTokenMarketDataByIds[0]
        ? json.data.getCoinGeckoTokenMarketDataByIds[0].current_price.toString()
        : null;
    })
    .catch(() => null);
};

export const getMarketInfoByIDs = (
  ids: string[]
): Promise<Array<CoinGeckoTokenMarket | null>> => {
  const params = ids.map((i) => '\\"' + i + '\\"').join(", ");
  return ethvmPost(
    '{"operationName":null,"variables":{},"query":"{\\n  getCoinGeckoTokenMarketDataByIds(coinGeckoTokenIds: [' +
      params +
      ']) {\\n    id\\n    symbol\\n    name\\n    image\\n    market_cap\\n    market_cap_rank\\n    high_24h\\n    low_24h\\n    price_change_24h\\n    price_change_percentage_24h\\n    sparkline_in_7d {\\n      price\\n    }\\n    price_change_percentage_7d_in_currency\\n    current_price\\n  }\\n}\\n"}'
  ).then((json) => {
    return json.data.getCoinGeckoTokenMarketDataByIds as CoinGeckoTokenMarket[];
  });
};
