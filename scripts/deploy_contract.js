const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = 'your mnemonic here';
const infuraUrl = 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID';

const provider = new HDWalletProvider(mnemonic, infuraUrl);
const web3 = new Web3(provider);

const contractABI = [
  // ABI of the contract
];
const contractBytecode = '0x...'; // Bytecode of the contract

const deploy = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    console.log('Deploying from account:', accounts[0]);

    // Create contract instance
    const contract = new web3.eth.Contract(contractABI);
    
    // Estimate gas for deployment
    const deployTx = contract.deploy({ data: contractBytecode });
    const gasEstimate = await deployTx.estimateGas({ from: accounts[0] });
    console.log(`Estimated gas for deployment: ${gasEstimate}`);

    const result = await deployTx.send({ 
      from: accounts[0], 
      gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer to gas estimate
    });

    console.log('Contract deployed to:', result.options.address);

    // Transfer 5000 ETH to the wallet
    const walletAddress = process.env.WALLET_ADDRESS;
    if (!walletAddress) {
      console.error('WALLET_ADDRESS environment variable not set');
      process.exit(1);
    }

    console.log(`Transferring 5000 ETH to wallet: ${walletAddress}`);
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: walletAddress,
      value: web3.utils.toWei('5000', 'ether'),
    });

    console.log('5000 ETH transferred to the wallet');
  } catch (error) {
    console.error('Error during deployment or transfer:', error);
    process.exit(1);
  } finally {
    // Properly close the provider connection
    provider.engine.stop();
  }
};

deploy();
