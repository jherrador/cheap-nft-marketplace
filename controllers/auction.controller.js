const { ethers } = require("ethers");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const signatureService = require("../services/signature.service");
const nftService = require("../services/nft.service");

const controller = {};
const MARKETPLACE_ADDRESS = "0x81782d0400361293ACB55A6709Ef212C70EAdB4e";
const PROVIDER = "https://eth-rinkeby.alchemyapi.io/v2/WWJwKWkSCfJISmjtheW46Dz1Zbti0VLA";

controller.list = (req, res) => {
  console.log("Should list all nfts in auction");
  res.render("pages/auction", { nfts: req.app.get("listedNfts") });
};

controller.new = async (req, res) => {
  const { params } = req;
  const provider = new ethers.providers.JsonRpcProvider(PROVIDER);
  const auction = {
    tokenId: params.tokenId,
    contractAddress: params.tokenAddress,
    minimumBid: params.minimumBid,
  };

  const types = {
    Auction: [
      { name: "tokenId", type: "uint" },
      { name: "contractAddress", type: "address" },
      { name: "minimumBid", type: "uint" },
    ],
  };

  const network = await provider.getNetwork();
  const domain = {
    name: "Cheap NFT Marketplace",
    version: "1",
    chainId: network.chainId,
    verifyingContract: MARKETPLACE_ADDRESS,
  };

  if (!await
  signatureService.verify(params.signature, domain, types, auction, params.ownerAddress)) {
    console.log("Entro");
    res.status(400).send({
      message: "Invalid Signature",
    });
    return;
  }
  const nftDetails = await nftService.getDetails(params.tokenAddress, params.tokenId);
  const newItem = {
    elementId: uuidv4(),
    owner: params.ownerAddress,
    contract: params.tokenAddress,
    tokenId: params.tokenId,
    name: nftDetails.name,
    minimumBid: params.minimumBid,
    listingSignature: params.signature,
    image: nftDetails.image,
    bidSignatures: [],
    buyer: null,
    buyerBid: null,
    status: "listed",
    lastUpdate: moment().format(),
  };
  console.log(newItem);

  req.app.get("listedNfts").push(newItem);

  res.json(req.app.get("listedNfts"));
};

controller.bid = async (req, res) => {
  const { params } = req;
  const allNfts = req.app.get("listedNfts");
  console.log(allNfts);
  const bidedNftIndex = allNfts.findIndex((nft) => nft.elementId === params.elementId);
  console.log(params.elementId);
  console.log(bidedNftIndex);
  console.log(allNfts[bidedNftIndex]);
  const provider = new ethers.providers.JsonRpcProvider(PROVIDER);
  const auction = {
    tokenId: allNfts[bidedNftIndex].tokenId,
    contractAddress: allNfts[bidedNftIndex].contract,
    ownerAddress: allNfts[bidedNftIndex].owner,
    bidderAddress: params.bidderAddress,
    bid: params.bid,
  };

  const types = {
    Auction: [
      { name: "tokenId", type: "uint" },
      { name: "contractAddress", type: "address" },
      { name: "ownerAddress", type: "address" },
      { name: "bidderAddress", type: "address" },
      { name: "bid", type: "uint" },
    ],
  };

  const network = await provider.getNetwork();
  const domain = {
    name: "Cheap NFT Marketplace",
    version: "1",
    chainId: network.chainId,
    verifyingContract: MARKETPLACE_ADDRESS,
  };

  if (!await
  signatureService.verify(params.signature, domain, types, auction, allNfts[bidedNftIndex].owner)) {
    res.status(400).send({
      message: "Invalid Signature",
    });
    return;
  }

  allNfts[bidedNftIndex].buyer = params.bidderAddress;
  allNfts[bidedNftIndex].buyerBid = params.bid;
  allNfts[bidedNftIndex].status = "bidded";
  allNfts[bidedNftIndex].lastUpdate = moment().format();
  allNfts[bidedNftIndex].bidSignatures.push(params.signature);

  req.app.set("listedNfts", allNfts);

  res.json(req.app.get("listedNfts"));
};
module.exports = controller;
