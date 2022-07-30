const nftService = require("../services/nft.service");

const controller = {};

controller.list = (req, res) => {
  console.log("Should list all nfts in auction");
  res.render("pages/auction", { nfts: req.app.get("listedNfts") });
};

controller.new = async (req, res) => {
  await nftService.getDetails(req.params.tokenAddress, req.params.tokenId).then((nftDetails) => {
    const newItem = {
      image: nftDetails.image,
      address: nftDetails.owner,
      name: nftDetails.name,
      description: nftDetails.description,
      price: "1",
      status: "new",
      lastUpdate: "10/10/2010",
    };
    req.app.get("listedNfts").push(newItem);

    res.json(newItem);
  });
};

module.exports = controller;
