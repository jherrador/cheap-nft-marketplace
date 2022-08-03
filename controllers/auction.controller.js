const { ethers } = require("ethers");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const signatureService = require("../services/signature.service");
const nftService = require("../services/nft.service");

const controller = {};

controller.index = (req, res) => {
  res.render("pages/index");
};
controller.list = (req, res) => {
  res.render("pages/auction", { nfts: req.app.get("listedNfts") });
};

controller.listAllNfts = (req, res) => {
  res.json(req.app.get("listedNfts"));
};
controller.new = async (req, res) => {
  const { params } = req;

  if (!await
  signatureService.verify("listing", params.signature, params.ownerAddress, params)) {
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
    bidSignatures: {},
    buyer: null,
    buyerBid: null,
    status: "listed",
    lastUpdate: moment().format(),
  };
  req.app.get("listedNfts").push(newItem);

  res.json(req.app.get("listedNfts"));
};

controller.bid = async (req, res) => {
  const { params } = req;
  const allNfts = req.app.get("listedNfts");
  const bidedNftIndex = allNfts.findIndex((nft) => nft.elementId === params.elementId);
  allNfts[bidedNftIndex].buyer = params.bidderAddress;
  allNfts[bidedNftIndex].buyerBid = params.bid;

  if (!await
  signatureService.verify("bid", params.signature, allNfts[bidedNftIndex].buyer, allNfts[bidedNftIndex])) {
    res.status(400).send({
      message: "Invalid Signature",
    });
    return;
  }

  allNfts[bidedNftIndex].status = "bidded";
  allNfts[bidedNftIndex].lastUpdate = moment().format();
  allNfts[bidedNftIndex].bidSignatures.buyer = params.signature;

  req.app.set("listedNfts", allNfts);

  res.json(req.app.get("listedNfts"));
};

controller.confirmBid = async (req, res) => {
  const { params } = req;
  const allNfts = req.app.get("listedNfts");

  const bidedNftIndex = allNfts.findIndex((nft) => nft.elementId === params.elementId);

  if (!await
  signatureService.verify("bid", params.signature, params.ownerAddress, allNfts[bidedNftIndex])) {
    res.status(400).send({
      message: "Invalid Signature",
    });
    return;
  }

  allNfts[bidedNftIndex].status = "confirmed";
  allNfts[bidedNftIndex].lastUpdate = moment().format();
  allNfts[bidedNftIndex].bidSignatures.owner = params.signature;

  req.app.set("listedNfts", allNfts);

  res.json(req.app.get("listedNfts"));
};

controller.finish = async (req, res) => {
  const { params } = req;
  const allNfts = req.app.get("listedNfts");

  const bidedNftIndex = allNfts.findIndex((nft) => nft.elementId === params.elementId);

  allNfts[bidedNftIndex].status = "finished";
  allNfts[bidedNftIndex].lastUpdate = moment().format();

  req.app.set("listedNfts", allNfts);

  res.json(req.app.get("listedNfts"));
};
module.exports = controller;
