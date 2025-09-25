import ethNode from './eth';
import etcNode from './etc';
import maticNode from './matic';
import maticZkNode from './maticzk';
import bscNode from './bsc';
import moonbeamNode from './glmr';
import moonriverNode from './movr';
import karuraEvmNode from './karura';
import okcNode from './okc';
import shidenEvmNode from './sdn';
import astarEvmNode from './astr';
import optimismNode from './op';
import cantoNode from './canto';
import rootstockNode from './rsk';
import rootstockTestnetNode from './rsk-testnet';
import edgeEvmNode from './edg';
import zkSepoliaNode from './zksepolia';
import vicNode from './vic';
import zkSyncNode from './zksync';
import arbNode from './arb';
import arbNovaNode from './arb-nova';
import * as skale from './skale';
import ontEVMNode from './ontevm';
import gnoNode from './gno';
import avaxNode from './avax';
import ftmNode from './ftm';
import kaiaNode from './kaia';
import auroraNode from './aurora';
import puppyNode from './puppy';
import deriveNode from './derive';
import sepoliaNode from './sepolia';
import baseNode from './base';
import celoNode from './celo';
import shibNode from './shib';
import syscoinNEVMTestNode from './syscoin/nevm-testnet';
import syscoinNEVMNode from './syscoin/nevm';
import rolluxTestNode from './syscoin/rollux-testnet';
import rolluxNode from './syscoin/rollux';
import sonicNode from './sonic';
import telosNode from './tlos';
import blastNode from './blast';
import sankoNode from './dmt';
import degenNode from './degen';
import zcdNode from './zcd';
import immutableZkevmNode from './immutable-zkevm';
import rariNode from './rari';
import formaNode from './forma';
import xlayerNode from './xlayer';
import godwokenNode from './godwoken';
import lineaNode from './linea';
import mantaPacificNode from './manta-pacific';
import modeNode from './mode';
import opbnbNode from './op-bnb';
import palmNode from './palm';
import proofOfPlayApexNode from './pop-apex';
import scrollNode from './scroll';
import cotiTestnetNode from './coti-testnet';
import hoodiNode from './hoodi';
import bitrockNode from './bitrock';
import fraxtalNode from './fraxtal';
import _5ireNode from './5ire';
import beraNode from './bera';
import storyNode from './story';
import gravityNode from './gravity';
import unichainNode from './unichain';
import abstractNode from './abstract';
import inkNode from './inkonchain';
import taraxa from './taraxa';
import coti from './coti';
import cytonicTestnetNode from './cytonic-testnet';
import unitZero from './unitzero';
import unitZeroTestnet from './unitzero-testnet';
import conflux from './conflux';
import hemi from './hemi';
import coredao from './coredao';
import appLayerTestnet from './applayer-testnet';
import nibiru from './nibiru';
import nibiruTestnet from './nibiru-testnet';
// import tac from './tac'; waiting for RPC fix

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
  zkSepolia: zkSepoliaNode,
  vic: vicNode,
  zkSync: zkSyncNode,
  skaleEuropa: skale.europaNode,
  skaleBlockBrawlers: skale.blockBrawlersNode,
  skaleCalypso: skale.calypsoNode,
  skaleCryptoBlades: skale.cryptoBladesNode,
  skaleCryptoColosseum: skale.cryptoColosseumNode,
  skaleExorde: skale.exordeNode,
  skaleNebula: skale.nebulaNode,
  skaleTitan: skale.titanNode,
  ontEVM: ontEVMNode,
  arbitrum: arbNode,
  arbitrumNova: arbNovaNode,
  gnosis: gnoNode,
  avax: avaxNode,
  fantom: ftmNode,
  kaia: kaiaNode,
  aurora: auroraNode,
  puppy: puppyNode,
  base: baseNode,
  celo: celoNode,
  shib: shibNode,
  syscoinNEVMTest: syscoinNEVMTestNode,
  syscoinNEVM: syscoinNEVMNode,
  rolluxTest: rolluxTestNode,
  rollux: rolluxNode,
  sonic: sonicNode,
  telos: telosNode,
  blast: blastNode,
  sanko: sankoNode,
  degen: degenNode,
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
  cotiTestnetNode: cotiTestnetNode,
  hoodi: hoodiNode,
  bitrock: bitrockNode,
  frax: fraxtalNode,
  taraxa: taraxa,
  '5ire': _5ireNode,
  bera: beraNode,
  story: storyNode,
  gravity: gravityNode,
  unichain: unichainNode,
  abstract: abstractNode,
  ink: inkNode,
  coti: coti,
  cytonicTestnet: cytonicTestnetNode,
  derive: deriveNode,
  unitZero: unitZero,
  unitZeroTestnet: unitZeroTestnet,
  conflux: conflux,
  hemi: hemi,
  coredao: coredao,
  nibiru: nibiru,
  nibiruTestnet: nibiruTestnet,
  appLayerTestnet: appLayerTestnet,
  // tac: tac, waiting for RPC fix
};
