const MARKETPLACE_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "erc721Address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sellerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sellAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "erc20Address",
        type: "address",
      },
    ],
    name: "CreateMarketSale",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "signature",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "signer",
        type: "address",
      },
    ],
    name: "VerifySignature",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "erc721Address",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "sellerAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "buyerAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "sellAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "erc20Address",
        type: "address",
      },
    ],
    name: "createMarketSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "splitSignature",
    outputs: [
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "contractAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "ownerAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "bidderAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "bid",
            type: "uint256",
          },
        ],
        internalType: "struct Signature.Auction",
        name: "auction",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
    ],
    name: "verifySignature",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
