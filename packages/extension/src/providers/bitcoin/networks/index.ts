import btcNode from "./bitcoin";
import btcTestNode from "./bitcoin-testnet";
import ltcNode from "./litecoin";
import dogeNode from "./dogecoin";
import bchNode from "./bitcoin-cash";

export default {
  bitcoin: btcNode,
  bitcoinTest: btcTestNode,
  litecoin: ltcNode,
  dogecoin: dogeNode,
  bitcoinCash: bchNode,
};
