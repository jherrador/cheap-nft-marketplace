const express = require("express");
const controller = require("../controllers/auction.controller");

const router = express.Router();

router.get("/auction/list", controller.list);

router.post("/auction/new/:tokenAddress/:tokenId/:minimumBid/:signature/:ownerAddress", controller.new);
router.post("/auction/bid/:elementId/:bid/:signature/:bidderAddress", controller.bid);

module.exports = router;
