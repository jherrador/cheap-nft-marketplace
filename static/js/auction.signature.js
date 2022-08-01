const Web3 = require("web3");

const web3 = new Web3("https://polygon-rpc.com/"); // Refactor to ropsten and parametrize

const signListing = async () => {
  const messageHash = web3.eth.accounts.hashMessage("JAVI");
  const from = web3.eth.accounts[0];

  console.log("Message Hash: ", messageHash);
  console.log("from signer ", from);

  await web3.eth.sign(messageHash, from).then(console.log);
};
