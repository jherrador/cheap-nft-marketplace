const ERC721_ADDRESS = "0xbDe6e860D0a32eC37F30562F6c915D2A580ef71d";
const ERC20_ADDRESS = "0xB55BbBCF56AD761A4E1b85d7E6bbD1b27c99570D";
const MARKETPLACE_ADDRESS = "0x08a01AE2547c67B7ece24BcCeabB61159675c6bF";
const DEFAULT_TOKEN_URI = "https://ipfs.io/ipfs/QmdzBhpibPZTPBPL1DPXnv8AvLoAN5TTDzczWw36RoSkoP";
const SIGNATURE_TYPE_LIST = {
  Auction: [
    { name: "tokenId", type: "uint256" },
    { name: "contractAddress", type: "address" },
    { name: "minimumBid", type: "uint256" },
  ],
};

const SIGNATURE_TYPE_BID = {
  Auction: [
    { name: "tokenId", type: "uint256" },
    { name: "contractAddress", type: "address" },
    { name: "ownerAddress", type: "address" },
    { name: "bidderAddress", type: "address" },
    { name: "bid", type: "uint256" },
  ],
};
