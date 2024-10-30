import ethNode from "./eth";
import etcNode from "./etc";
import maticNode from "./matic";
import maticZkNode from "./maticzk";
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
import rootstockTestnetNode from "./rsk-testnet";
import edgeEvmNode from "./edg";
import zkGoerliNode from "./zkgoerli";
import vicNode from "./vic";
import zkSyncNode from "./zksync";
import arbNode from "./arb";
import arbNovaNode from "./arb-nova";
import * as skale from "./skale";
import ontEVMNode from "./ontevm";
import gnoNode from "./gno";
import avaxNode from "./avax";
import ftmNode from "./ftm";
import klayNode from "./klay";
import auroraNode from "./aurora";
import puppyNode from "./puppy";
import sepoliaNode from "./sepolia";
import baseNode from "./base";
import celoNode from "./celo";
import shibNode from "./shib";
import artheraNode from "./aa";
import formTestnet from "./form-testnet";
import artheraTestNode from "./aat";
import syscoinTestNode from "./tsys";
import syscoinNode from "./sys";
import rolluxTestNode from "./trlx";
import rolluxNode from "./rlx";
import cagaAnkara from "./cagaAnkara";
import telosNode from "./tlos";
import blastNode from "./blast";
import sankoNode from "./dmt";
import degenNode from "./degen";
import hamNode from "./ham";
import zcdNode from "./zcd";
import immutableZkevmNode from "./immutable-zkevm";
import rariNode from "./rari";
import formaNode from "./forma";
import xlayerNode from "./xlayer";
import godwokenNode from "./godwoken";
import lineaNode from "./linea";
import mantaPacificNode from "./manta-pacific";
import modeNode from "./mode";
import opbnbNode from "./op-bnb";
import palmNode from "./palm";
import proofOfPlayApexNode from "./pop-apex";
import scrollNode from "./scroll";
import cotiDevnetNode from "./coti-devnet";
import holeskyNode from "./holesky";
import bitrockNode from "./bitrock";

export default {
  sepolia: sepoliaNode,
  ethereum: ethNode,
  etc: etcNode,
  matic: maticNode,
  maticzk: maticZkNode,
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
  rootstockTestnet: rootstockTestnetNode,
  edgeEvm: edgeEvmNode,
  zkGoerli: zkGoerliNode,
  vic: vicNode,
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
  arbitrumNova: arbNovaNode,
  gnosis: gnoNode,
  avax: avaxNode,
  fantom: ftmNode,
  klaytn: klayNode,
  aurora: auroraNode,
  puppy: puppyNode,
  base: baseNode,
  celo: celoNode,
  shib: shibNode,
  arthera: artheraNode,
  formTestnet: formTestnet,
  artheraTest: artheraTestNode,
  syscoinTest: syscoinTestNode,
  syscoin: syscoinNode,
  rolluxTest: rolluxTestNode,
  rollux: rolluxNode,
  cagaAnkara: cagaAnkara,
  telos: telosNode,
  blast: blastNode,
  sanko: sankoNode,
  degen: degenNode,
  ham: hamNode,
  zcd: zcdNode,
  immutableZkevm: immutableZkevmNode,
  rari: rariNode,
  forma: formaNode,
  xlayer: xlayerNode,
  godwoken: godwokenNode,
  linea: lineaNode,
  mantaPacific: mantaPacificNode,
  mode: modeNode,
  opbnb: opbnbNode,
  palm: palmNode,
  popApex: proofOfPlayApexNode,
  scroll: scrollNode,
  cotiDevnet: cotiDevnetNode,
  holesky: holeskyNode,
  bitrock: bitrockNode,
};
