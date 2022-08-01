// Deprecated

const nftService = {};
const { ethers } = require("ethers");
const axios = require("axios");
const erc721Abi = require("../ABI/erc721.abi");

const provider = new ethers.providers.JsonRpcProvider(); // Refactor to robsten and parametrize
nftService.getDetails = async (tokenAddress, tokenId) => {
  const contract = new ethers.Contract(tokenAddress, erc721Abi, provider);
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
