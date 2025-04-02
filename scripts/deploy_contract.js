const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = 'your mnemonic here';
const infuraUrl = 'https://ropsten.infura.io/v3/YOUR_INFURA_PROJECT_ID';

const provider = new HDWalletProvider(mnemonic, infuraUrl);
const web3 = new Web3(provider);

const contractABI = [
  // ABI of the contract
];
const contractBytecode = '0x...'; // Bytecode of the contract

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Deploying from account:', accounts[0]);

  const result = await new web3.eth.Contract(contractABI)
    .deploy({ data: contractBytecode })
    .send({ from: accounts[0], gas: '1000000' });

  console.log('Contract deployed to:', result.options.address);

  // Transfer 5000 ETH to the wallet
  await web3.eth.sendTransaction({
    from: accounts[0],
    to: 'your wallet address here',
    value: web3.utils.toWei('5000', 'ether'),
  });

  console.log('5000 ETH transferred to the wallet');
};

deploy();
