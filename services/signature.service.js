// Deprecated

const signatureService = {};
const { ethers } = require("ethers");

const PROVIDER_URL = "https://eth-rinkeby.alchemyapi.io/v2/WWJwKWkSCfJISmjtheW46Dz1Zbti0VLA";
const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

signatureService.verify = async (signatureType, signature, owner, params) => {
  let domain;
  let type;
  let data;

  if (signatureType === "listing") {
    [domain, type, data] = await signatureService._prepareListingSignature(params);
  } else if (signatureType === "bid") {
    [domain, type, data] = await signatureService._prepareBidSignature(params);
  }

  return ethers.utils.verifyTypedData(domain, type, data, signature) === owner;
};

signatureService._prepareBidSignature = async (_data) => {
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
    name: "Cheap NFT Marketplace",
    version: "1",
    chainId: network.chainId,
    verifyingContract: "0x08a01AE2547c67B7ece24BcCeabB61159675c6bF",
  };

  return [domain, type, data];
};

signatureService._prepareListingSignature = async (_data) => {
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
    name: "Cheap NFT Marketplace",
    version: "1",
    chainId: network.chainId,
    verifyingContract: "0x08a01AE2547c67B7ece24BcCeabB61159675c6bF",
  };

  return [domain, type, data];
};

module.exports = signatureService;
