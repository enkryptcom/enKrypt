import btcNode from './bitcoin';
import btcTestNode from './bitcoin-testnet';
import ltcNode from './litecoin';
import dogeNode from './dogecoin';
import sysNode from './syscoin';
import sysTestNode from './syscoin-testnet';

export default {
  bitcoin: btcNode,
  bitcoinTest: btcTestNode,
  litecoin: ltcNode,
  dogecoin: dogeNode,
  syscoin: sysNode,
  syscoinTest: sysTestNode
};
