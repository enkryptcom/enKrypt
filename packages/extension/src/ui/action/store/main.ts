import { MainState } from "../types/main";
import { ActionContext } from "vuex";

const state: MainState = {
  value: 0,
};

const getters = {
  value: (state: MainState): number => state.value,
};

const actions = {
  addValue({ commit }: ActionContext<MainState, any>, value: number): void {
    commit("addValue", value);
  },
};

const mutations = {
  addValue(state: MainState, value: number): void {
    state.value += value;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
