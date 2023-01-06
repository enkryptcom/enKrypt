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
import skaleEuropaNode from "./skale/europa";
import skaleBlockBrawlersNode from "./skale/blockBrawlers";
import skaleCalypsoNode from "./skale/calypso";
import skaleCryptoBladesNode from "./skale/cryptoBlades";
import skaleCryptoColosseumNode from "./skale/cryptoColosseum";
import skaleExordeNode from "./skale/exorde";
import skaleNebulaNode from "./skale/nebula";
import skaleRazorNode from "./skale/razor";
import skaleTitanNode from "./skale/titan";

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
  skaleEuropa: skaleEuropaNode,
  skaleBlockBrawlers: skaleBlockBrawlersNode,
  skaleCalypso: skaleCalypsoNode,
  skaleCryptoBlades: skaleCryptoBladesNode,
  skaleCryptoColosseum: skaleCryptoColosseumNode,
  skaleExorde: skaleExordeNode,
  skaleNebula: skaleNebulaNode,
  skaleRazor: skaleRazorNode,
  skaleTitan: skaleTitanNode,
};
