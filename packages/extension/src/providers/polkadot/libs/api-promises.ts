import SubstrateAPI from "@/providers/polkadot/libs/api";

const apiPromiseList: Record<string, SubstrateAPI> = {};

const addNewApi = (node: string, api: SubstrateAPI) => {
  apiPromiseList[node] = api;
};
const closeAllConnections = () => {
  Object.values(apiPromiseList).forEach((api) => api.api.disconnect());
};
const getApi = (node: string): SubstrateAPI => {
  return apiPromiseList[node];
};

export { addNewApi, closeAllConnections, getApi };
