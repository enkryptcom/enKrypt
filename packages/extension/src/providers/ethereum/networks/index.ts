import ethNode from "./eth";
import goerliNode from "./goerli";
import kovanNode from "./kov";
import ropstenNode from "./rop";
import rinkebyNode from "./rin";
import etcNode from "./etc";
import maticNode from "./matic";
import bscNode from "./bsc";
import moonbeamNode from "./glmr";
import moonriverNode from "./movr";
import karuraEvmNode from "./karura";
import okcNode from "./okc";
import shidenEvmNode from "./sdn";
import astarEvmNode from "./astr";
import optimismNode from "./op";
import cantoNode from "./canto";
import rootstockNode from "./rsk";
import edgeEvmNode from "./edg";
import zkGoerliNode from "./zkgoerli";
import zkSyncNode from "./zksync";

export default {
  goerli: goerliNode,
  ethereum: ethNode,
  kovan: kovanNode,
  ropsten: ropstenNode,
  rinkeby: rinkebyNode,
  etc: etcNode,
  matic: maticNode,
  bsc: bscNode,
  moonbeam: moonbeamNode,
  moonriver: moonriverNode,
  karuraEvm: karuraEvmNode,
  okc: okcNode,
  shidenEvm: shidenEvmNode,
  astarEvm: astarEvmNode,
  op: optimismNode,
  canto: cantoNode,
  rootstock: rootstockNode,
  edgeEvm: edgeEvmNode,
  zkGoerli: zkGoerliNode,
  zkSync: zkSyncNode,
};
