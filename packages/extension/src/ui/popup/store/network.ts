import { NetworkState, NetworkItem } from "../types/network";
import { ActionContext } from "vuex";

const state: NetworkState = {
  selected: undefined,
};

const getters = {
  selected: (state: NetworkState): NetworkItem | undefined => state.selected,
};

const actions = {
  setNetwork(
    { commit }: ActionContext<NetworkState, any>,
    value: NetworkItem
  ): void {
    commit("setNetwork", value);
  },
};

const mutations = {
  setNetwork(state: NetworkState, value: NetworkItem): void {
    state.selected = value;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
