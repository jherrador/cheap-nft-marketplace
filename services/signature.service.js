const signatureService = {};
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);

signatureService.verify = async (signatureType, signature, owner, params) => {
  let domain;
  let type;
  let data;

  if (signatureType === "listing") {
    [domain, type, data] = await signatureService.prepareListingSignature(params);
  } else if (signatureType === "bid") {
    [domain, type, data] = await signatureService.prepareBidSignature(params);
  }

  return ethers.utils.verifyTypedData(domain, type, data, signature) === owner;
};

signatureService.prepareBidSignature = async (_data) => {
  const data = {
    tokenId: _data.tokenId,
    contractAddress: _data.contract,
    ownerAddress: _data.owner,
    bidderAddress: _data.buyer,
    bid: _data.buyerBid,
  };

  const type = {
    Auction: [
      { name: "tokenId", type: "uint256" },
      { name: "contractAddress", type: "address" },
      { name: "ownerAddress", type: "address" },
      { name: "bidderAddress", type: "address" },
      { name: "bid", type: "uint256" },
    ],
  };
  const network = await provider.getNetwork();

  const domain = {
    name: process.env.APP_NAME,
    version: "1",
    chainId: network.chainId,
    verifyingContract: process.env.MARKETPLACE_CONTRACT,
  };

  return [domain, type, data];
};

signatureService.prepareListingSignature = async (_data) => {
  const data = {
    tokenId: _data.tokenId,
    contractAddress: _data.tokenAddress,
    minimumBid: _data.minimumBid,
  };

  const type = {
    Auction: [
      { name: "tokenId", type: "uint256" },
      { name: "contractAddress", type: "address" },
      { name: "minimumBid", type: "uint256" },
    ],
  };

  const network = await provider.getNetwork();
  const domain = {
    name: process.env.APP_NAME,
    version: "1",
    chainId: network.chainId,
    verifyingContract: process.env.MARKETPLACE_CONTRACT,
  };

  return [domain, type, data];
};

module.exports = signatureService;
