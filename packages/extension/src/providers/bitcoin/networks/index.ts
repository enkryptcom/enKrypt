import btcNode from './bitcoin';
import btcTestNode from './bitcoin-testnet';
import ltcNode from './litecoin';
import dogeNode from './dogecoin';
import firoTestnet from "./firo-testnet";
import firo from "./firo";

export default {
  bitcoin: btcNode,
  bitcoinTest: btcTestNode,
  firoTest: firoTestnet,
  firo: firo,
  litecoin: ltcNode,
  dogecoin: dogeNode,
};
