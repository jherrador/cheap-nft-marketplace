const express = require("express");
const controller = require("../controllers/auction.controller");

const router = express.Router();

router.get("/auction/list", controller.list);

router.post("/auction/new/:tokenAddress/:tokenId", controller.new);

module.exports = router;
