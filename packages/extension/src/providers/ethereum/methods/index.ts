import ethSendTransaction from "./eth_sendTransaction";
import ethSign from "./eth_sign";
import personalSign from "./personal_sign";
import ethAccounts from "./eth_accounts";
import ethSignTransaction from "./eth_signTransaction";
import ethSignTypedData from "./eth_signTypedData";
import ethgetEncryptionKey from "./eth_getEncryptionPublicKey";
import ethDecrypt from "./eth_decrypt";
import personalEcRecover from "./personal_ecRecover";
import addEthereumChain from "./wallet_addEthereumChain";
import switchEthereumChain from "./wallet_switchEthereumChain";
import watchAsset from "./wallet_watchAsset";
import walletRequestPermissions from "./wallet_requestPermissions";
import ethSendRawTransaction from "./eth_sendRawTransaction";
import enkryptGetPublickKey from "./enkrypt_getPublicKey";
export default [
  ethSendTransaction,
  ethSign,
  personalSign,
  ethAccounts,
  ethSignTransaction,
  ethSignTypedData,
  ethgetEncryptionKey,
  ethDecrypt,
  personalEcRecover,
  watchAsset,
  switchEthereumChain,
  addEthereumChain,
  walletRequestPermissions,
  ethSendRawTransaction,
  enkryptGetPublickKey,
];
