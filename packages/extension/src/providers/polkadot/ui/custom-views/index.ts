import { Component } from "vue";
import { SubstrateNetwork } from "../../types/substrate-network";
import BlindVerifyView from "./blind-approvetx.vue";
import mapping from "./mappings";

export const getViewAndProps = (
  network: SubstrateNetwork,
  method: string,
  data: any
) => {
  if (mapping[network.name_long] && mapping[network.name_long][method]) {
    const [view, getProps] = mapping[network.name_long][method];
    const props = getProps(network, data);

    if (props) {
      return [view, props];
    }
  }

  return [BlindVerifyView, {}] as [Component, any];
};
