import { provide, ref } from "vue";

export interface IChainProvider {
  chainId: number;
  setChainId: (id: number) => void;
}

export default {
  name: "chain-provider",
  setup() {
    console.log("running setup");
    const chainId = ref(1);

    const setChainId = (id: number) => {
      chainId.value = id;
    };

    provide("chain-provider", {
      chainId,
      setChainId,
    });
  },
};
