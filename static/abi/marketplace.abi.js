const MARKETPLACE_ABI = [{
  inputs: [{ internalType: "address", name: "erc721Address", type: "address" }, { internalType: "uint256", name: "tokenId", type: "uint256" }, { internalType: "address", name: "sellerAddress", type: "address" }, { internalType: "address", name: "buyerAddress", type: "address" }, { internalType: "uint256", name: "sellAmount", type: "uint256" }, { internalType: "address", name: "erc20Address", type: "address" }, { internalType: "string", name: "_hashedMessage", type: "string" }, { internalType: "bytes", name: "_signature", type: "bytes" }], name: "createMarketSale", outputs: [], stateMutability: "nonpayable", type: "function",
}, {
  inputs: [{ internalType: "address", name: "erc721Address", type: "address" }, { internalType: "uint256", name: "tokenId", type: "uint256" }, { internalType: "address", name: "sellerAddress", type: "address" }, { internalType: "address", name: "buyerAddress", type: "address" }, { internalType: "uint256", name: "sellAmount", type: "uint256" }, { internalType: "address", name: "erc20Address", type: "address" }], name: "createMarketSaleWithoutSignature", outputs: [], stateMutability: "nonpayable", type: "function",
}, {
  inputs: [], name: "signatureVerify", outputs: [{ internalType: "contract SignatureVerify", name: "", type: "address" }], stateMutability: "view", type: "function",
}];
