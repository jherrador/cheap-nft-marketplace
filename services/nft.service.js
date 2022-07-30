const nftService = {};
const Web3 = require("web3");
const axios = require("axios");
const erc721Abi = require("../ABI/erc721.abi");

const web3 = new Web3("https://polygon-rpc.com/"); // Refactor to robsten and parametrize
nftService.getDetails = async (tokenAddress, tokenId) => {
  const contract = new web3.eth.Contract(erc721Abi, tokenAddress);
  let metadata = { };
  let tokenURI = "";

  await contract.methods.tokenURI(tokenId).call().then(async (_tokenURI) => {
    tokenURI = _tokenURI;
  });

  await nftService.getMetadata(tokenURI).then((_metadata) => {
    metadata = _metadata;
  });

  await contract.methods.ownerOf(tokenId).call().then(async (_owner) => {
    metadata.owner = _owner;
  });
  const imgUrl = await nftService.getIpfsImageUri(tokenURI, metadata.image);

  metadata.image = imgUrl;

  console.log(metadata);
  return metadata;
};

nftService.getMetadata = async (tokenURI) => {
  let metadata = {};
  await axios.get(tokenURI)
    .then((response) => {
      metadata = response.data;
    })
    .catch((error) => {
      console.log("nft.service.getMetadata: ", error);
    });
  return metadata;
};

nftService.getIpfsImageUri = async (tokenURI, ipfsImage) => {
  const hash = ipfsImage.replace(/^ipfs?:\/\//, "");

  const ipfsDomain = tokenURI.substr(0, tokenURI.indexOf("/ipfs/") + 6);

  return ipfsDomain + hash;
};

module.exports = nftService;
