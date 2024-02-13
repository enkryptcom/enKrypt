import btcRequestAccounts from "./btc_requestAccounts";
import btcSignMessage from "./btc_signMessage";
import btcSendTransaction from "./btc_sendTransaction";
import btcGetBalance from "./btc_getBalance";
import btcSwitchNetwork from "./btc_switchNetwork";
import btcGetPublicKey from "./btc_getPublicKey";
import btcSignPsbt from "./btc_signPsbt";
export default [
  btcRequestAccounts,
  btcSignMessage,
  btcSendTransaction,
  btcGetBalance,
  btcSwitchNetwork,
  btcGetPublicKey,
  btcSignPsbt,
];
