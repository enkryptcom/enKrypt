import { GasPriceTypes } from "@/providers/common/types";

interface FeeType {
  fast: {
    satsPerKiloByte: number;
  };
  average: {
    satsPerKiloByte: number;
  };
  slow: {
    satsPerKiloByte: number;
  };
}
const SSFeeHandler = async (
  url: string
): Promise<Record<GasPriceTypes, number>> => {
  return fetch(url)
    .then((res) => res.json())
    .then((json: FeeType) => {
      if (json.fast.satsPerKiloByte < 0)
        json.fast.satsPerKiloByte = json.average.satsPerKiloByte;
      if (json.average.satsPerKiloByte < 0)
        json.average.satsPerKiloByte = json.slow.satsPerKiloByte;
      return {
        [GasPriceTypes.FASTEST]:
          Math.ceil(json.fast.satsPerKiloByte / 1024) + 5,
        [GasPriceTypes.FAST]: Math.ceil(json.fast.satsPerKiloByte / 1024) + 3,
        [GasPriceTypes.REGULAR]:
          Math.ceil(json.average.satsPerKiloByte / 1024) + 2,
        [GasPriceTypes.ECONOMY]: Math.ceil(json.slow.satsPerKiloByte / 1024),
      };
    });
};

export default SSFeeHandler;
