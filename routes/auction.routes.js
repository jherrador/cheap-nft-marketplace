const express = require("express");
const controller = require("../controllers/auction.controller");

const router = express.Router();

router.get("/auction/list", controller.list);
router.get("/auction/listedItems", controller.listAllNfts);

router.post("/auction/new/:tokenAddress/:tokenId/:minimumBid/:signature/:ownerAddress", controller.new);
router.post("/auction/bid/:elementId/:bid/:signature/:bidderAddress", controller.bid);
router.post("/auction/confirm/bid/:elementId/:signature/:ownerAddress", controller.confirmBid);
router.post("/auction/finish/:elementId", controller.finish);

module.exports = router;
