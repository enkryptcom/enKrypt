import ethSendTransaction from "./eth_sendTransaction";
import ethSign from "./eth_sign";
import personalSign from "./personal_sign";
import ethAccounts from "./eth_accounts";
import ethCoinbase from "./eth_coinbase";
import ethSignTransaction from "./eth_signTransaction";
import ethSignTypedData from "./eth_signTypedData";
import ethgetEncryptionKey from "./eth_getEncryptionPublicKey";
import ethDecrypt from "./eth_decrypt";
export default [
  ethSendTransaction,
  ethSign,
  personalSign,
  ethAccounts,
  ethCoinbase,
  ethSignTransaction,
  ethSignTypedData,
  ethgetEncryptionKey,
  ethDecrypt,
];
