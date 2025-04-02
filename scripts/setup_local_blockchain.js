const Ganache = require('ganache-core');
const Web3 = require('web3');

const server = Ganache.server({
  accounts: [
    {
      balance: Web3.utils.toWei('5000', 'ether'),
    },
  ],
});

server.listen(8545, (err, blockchain) => {
  if (err) {
    console.error('Error starting Ganache server:', err);
  } else {
    console.log('Ganache server is running on http://localhost:8545');
  }
});
