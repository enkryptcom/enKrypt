import ethNode from "./eth";
import goerliNode from "./goerli";
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
import tomoNode from "./tomo";
import zkSyncNode from "./zksync";
import arbNode from "./arb";
import * as skale from "./skale";
import ontEVMNode from "./ontevm";
import gnoNode from "./gno";
import avaxNode from "./avax";
import ftmNode from "./ftm";
import klayNode from "./klay";
import auroraNode from "./aurora";
import puppyNode from "./puppy";
import sepoliaNode from "./sepolia";

export default {
  goerli: goerliNode,
  sepolia: sepoliaNode,
  ethereum: ethNode,
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
  tomo: tomoNode,
  zkSync: zkSyncNode,
  skaleEuropa: skale.europaNode,
  skaleBlockBrawlers: skale.blockBrawlersNode,
  skaleCalypso: skale.calypsoNode,
  skaleCryptoBlades: skale.cryptoBladesNode,
  skaleCryptoColosseum: skale.cryptoColosseumNode,
  skaleExorde: skale.exordeNode,
  skaleNebula: skale.nebulaNode,
  skaleRazor: skale.razorNode,
  skaleTitan: skale.titanNode,
  skaleChaos: skale.chaosNode,
  ontEVM: ontEVMNode,
  arbitrum: arbNode,
  gnosis: gnoNode,
  avax: avaxNode,
  fantom: ftmNode,
  klaytn: klayNode,
  aurora: auroraNode,
  puppy: puppyNode,
};
