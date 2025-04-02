const fs = require('fs');
const path = require('path');

// Load contract artifacts from the build directory
const contractPath = path.resolve(__dirname, '../build/contracts/YourContract.json');
if (!fs.existsSync(contractPath)) {
  console.error(`Contract artifacts not found at: ${contractPath}`);
  process.exit(1);
}

const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const contractABI = contractArtifact.abi;
const contractBytecode = contractArtifact.bytecode;
