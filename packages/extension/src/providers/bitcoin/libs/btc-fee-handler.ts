import { GasPriceTypes } from "@/providers/common/types";

const BTCFeeHandler = async (): Promise<Record<GasPriceTypes, number>> => {
  return fetch(`https://bitcoiner.live/api/fees/estimates/latest`)
    .then((res) => res.json())
    .then((json) => {
      return {
        [GasPriceTypes.FASTEST]: Math.ceil(json.estimates["30"].sat_per_vbyte),
        [GasPriceTypes.FAST]: Math.ceil(json.estimates["60"].sat_per_vbyte),
        [GasPriceTypes.REGULAR]: Math.ceil(json.estimates["120"].sat_per_vbyte),
        [GasPriceTypes.ECONOMY]: Math.ceil(json.estimates["180"].sat_per_vbyte),
      };
    })
    .catch(() => ({
      [GasPriceTypes.FASTEST]: 25,
      [GasPriceTypes.FAST]: 20,
      [GasPriceTypes.REGULAR]: 10,
      [GasPriceTypes.ECONOMY]: 5,
    }));
};

export default BTCFeeHandler;
