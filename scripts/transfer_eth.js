const Web3 = require('web3');

// Updated scripts/transfer_eth.js

// Change the Web3 initialization URL from Ropsten to Sepolia
const web3 = new Web3('https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID');

// ... other code ...

// Update the network configuration (if applicable)
// Original network config example:
// const networkConfig = {
//     chainId: 3, // Ropsten network ID
//     // other configuration
// };
//
// Updated configuration:
const networkConfig = {
    chainId: 11155111, // Sepolia network ID
    // other configuration
};

const senderAddress = '0xYourSenderAddress';
const receiverAddress = '0xYourReceiverAddress';
const privateKey = '0xYourPrivateKey';

async function transferETH() {
  const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest');
  const transaction = {
    to: receiverAddress,
    value: web3.utils.toWei('5000', 'ether'),
    gas: 21000,
    nonce: nonce,
    chainId: 3, // Ropsten network ID
  };

  const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  console.log('Transaction receipt:', receipt);
}

transferETH();
