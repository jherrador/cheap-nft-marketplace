const web3 = AlchemyWeb3.createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/WWJwKWkSCfJISmjtheW46Dz1Zbti0VLA",
);
const createAuction = new bootstrap.Modal(document.getElementById("create-auction-modal"));
const bidModal = new bootstrap.Modal(document.getElementById("bid-modal"));
let provider;
let signer;
let auctionNFTs = [];
const ERC721_ADDRESS = "0xbDe6e860D0a32eC37F30562F6c915D2A580ef71d";
const ERC20_ADDRESS = "0xB55BbBCF56AD761A4E1b85d7E6bbD1b27c99570D";
const MARKETPLACE_ADDRESS = "0x08a01AE2547c67B7ece24BcCeabB61159675c6bF";
const DEFAULT_TOKEN_URI = "https://ipfs.io/ipfs/QmdzBhpibPZTPBPL1DPXnv8AvLoAN5TTDzczWw36RoSkoP";
let chainId;
let domain;
const types = {
  Auction: [
    { name: "tokenId", type: "uint256" },
    { name: "contractAddress", type: "address" },
    { name: "minimumBid", type: "uint256" },
  ],
};

const typeBid = {
  Auction: [
    { name: "tokenId", type: "uint256" },
    { name: "contractAddress", type: "address" },
    { name: "ownerAddress", type: "address" },
    { name: "bidderAddress", type: "address" },
    { name: "bid", type: "uint256" },
  ],
};

const refreshAuctionList = (nfts) => {
  document.getElementById("listed_nfts").innerHTML = "";
  if (nfts.length <= 0) {
    return;
  }
  document.getElementById("listed-nft").style.display = "inline";

  nfts.forEach(async (nft) => {
    let button = "";
    const signerAddress = await signer.getAddress();
    if (nft.status === "listed") {
      if (signerAddress === nft.owner) {
        button = "<button class=\"btn btn-white stretched-link w-100\" disabled>Your NFT</button>";
      } else {
        button = `<button class="btn btn-primary stretched-link w-100" onclick="bid('${nft.elementId}')">Bid</button>`;
      }
    } else if (nft.status === "bidded") {
      if (signerAddress === nft.owner) {
        button = `<button class="btn btn-primary stretched-link w-100" onclick="confirmBid('${nft.elementId}')">Confirm Bid</button>`;
      } else {
        button = "<button class=\"btn btn-white stretched-link w-100\" onclick=\"\" disabled>Already Bidded</button>";
      }
    } else if (nft.status === "confirmed") {
      if (signerAddress === nft.owner || signerAddress === nft.buyer) {
        button = `<button class="btn btn-primary stretched-link w-100" onclick="trade('${nft.elementId}')" id="btn-trade">Trade</button>`;
      } else {
        button = "<button class=\"btn btn-white stretched-link w-100\" onclick=\"\" disabled>Unavailable</button>";
      }
    } else if (nft.status === "finished") {
      button = "<button class=\"btn btn-white stretched-link w-100\" disabled>Finished</button>";
    }

    const nftElement = `
    <div class="col-xl-3 col-md-4 col-sm-6 mb-5">
      <div class="card">
        <img src='${nft.image}' alt='' class="img-fluid px-3 py-3"/>
        <div class="card-body">
          <h5 class="card-title">${nft.name} ${parseInt(nft.tokenId) > 10000 ? "" : `#${parseInt(nft.tokenId)}`}</h5>
          ${button}
        </div>
      </div>
    </div>`;

    document.getElementById("listed_nfts").innerHTML += nftElement;
  });
};

const getListedNfts = async () => {
  await axios.get("/auction/listedItems/", {
  })
    .then(async (response) => {
      auctionNFTs = response.data;

      await refreshAuctionList(auctionNFTs);
    })
    .catch((error) => {
      console.log("auction.getListedNfts: Cannot add new nft to the auction", error);
    });
};

window.ethereum.on("accountsChanged", (accounts) => {
  location.reload();
});

const addNewItem = async (contractAddress, tokenId, hashId) => {
  let minbid = document.getElementById("auction-min-bid").value;
  if (minbid === undefined || minbid === "" || minbid <= 0) {
    document.getElementById("min-bid-required-text").classList.remove("d-none");
    return;
  }
  minbid = ethers.utils.parseEther(minbid);

  document.getElementById("min-bid-required-text").classList.add("d-none");

  const data = {
    tokenId,
    contractAddress,
    minimumBid: minbid,
  };

  const signature = await signer._signTypedData(domain, types, data);

  document.getElementById(`btn-nft-${hashId}`).innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span> Select";
  document.getElementById(`btn-nft-${hashId}`).disabled = true;
  await axios.post(`/auction/new/${contractAddress}/${tokenId}/${minbid}/${signature}/${await signer.getAddress()}`, {
  })
    .then(async (response) => {
      auctionNFTs = response.data;
      await refreshAuctionList(auctionNFTs);

      createAuction.hide();
    })
    .catch((error) => {
      console.log("auction.addNewItem: Cannot add new nft to the auction", error);
    });
};

const listAllNfts = async () => {
  // Get all NFTs using alchemy
  const nfts = await web3.alchemy.getNfts({ owner: await signer.getAddress() });

  return nfts.ownedNfts;
};

const prepareAuction = async () => {
  document.getElementById("auction-form").style.display = "none";
  document.getElementById("owner_nfts").innerHTML = "";
  document.getElementById("auction-min-bid").value = "";
  createAuction.show();

  const nfts = await listAllNfts();

  if (nfts.length === 0 || nfts === undefined) {
    document.getElementById("owner_nfts").innerHTML = "<button class=\"btn btn-primary\" onclick=\"mint()\">Mint NFT </button>";
  } else {
    document.getElementById("auction-form").style.display = "inline";
  }
  nfts.forEach((nft) => {
    let alreadyListed = false;
    auctionNFTs.forEach(async (_nft) => {
      if (_nft.contract === nft.contract.address && parseInt(_nft.tokenId) === parseInt(nft.id.tokenId)) {
        alreadyListed = true;
      }
    });

    if (!alreadyListed) {
      appendNFTToList(nft);
    }
  });

  if (document.getElementById("owner_nfts").innerHTML === "") {
    document.getElementById("auction-form").style.display = "none";
    document.getElementById("owner_nfts").innerHTML = "<button class=\"btn btn-primary\" onclick=\"mint()\">Mint NFT </button>";
  }
  document.getElementById("create-auction-modal-loader").style.visibility = "hidden";
};

const appendNFTToList = (nft) => {
  const nftElement = `
  <div class="col-xl-3 col-md-4 col-sm-6 mb-5">
    <div class="card">
      <img src='${nft.media[0].gateway}' alt='' class="img-fluid px-3 py-3"/>
      <div class="card-body">
        <h5 class="card-title">${nft.title} ${parseInt(nft.id.tokenId) > 10000 ? "" : `#${parseInt(nft.id.tokenId)}`}</h5>
        <button id="btn-nft-${nft.contract.address}${nft.id.tokenId}" class="btn btn-primary stretched-link w-100" onclick="addNewItem('${nft.contract.address}', ${parseInt(nft.id.tokenId)}, '${nft.contract.address}${nft.id.tokenId}')">Select</button>
      </div>
    </div>
  </div>`;

  document.getElementById("owner_nfts").innerHTML += nftElement;
};

const mint = async () => {
  const erc721Contract = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, provider);
  const contractWithSigner = erc721Contract.connect(signer);

  contractWithSigner.createCollectible(await signer.getAddress(), DEFAULT_TOKEN_URI);

  erc721Contract.on("Transfer", (from, to, tokenID) => {
    location.reload();
  });
};
const mintErc20 = async () => {
  const erc20Contract = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, provider);
  const contractWithSigner = erc20Contract.connect(signer);

  contractWithSigner.mint(await signer.getAddress(), ethers.utils.parseEther("100"));

  erc20Contract.on("Transfer", (from, to, tokenID) => {
    location.reload();
  });
};

const approveAllERC721 = () => {
  const erc721Contract = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, provider);
  const contractWithSigner = erc721Contract.connect(signer);

  contractWithSigner.setApprovalForAll(MARKETPLACE_ADDRESS, true);

  document.getElementById("auction-btn").innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span> Enable Auction";
  document.getElementById("auction-btn").disabled = true;

  erc721Contract.on("ApprovalForAll", async (owner, operator, approved) => {
    if (owner === await signer.getAddress() && operator === MARKETPLACE_ADDRESS) {
      await setAuctionButton();
    }
  });
};

const checkApproveAllERC721 = async () => {
  const erc721Contract = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, provider);
  const contractWithSigner = erc721Contract.connect(signer);

  return await contractWithSigner.isApprovedForAll(await signer.getAddress(), MARKETPLACE_ADDRESS);
};

const approveERC20 = async () => {
  const erc20Contract = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, provider);
  const contractWithSigner = erc20Contract.connect(signer);

  contractWithSigner.approve(MARKETPLACE_ADDRESS, ethers.constants.MaxUint256);

  document.getElementById("btn-bid-confirm").innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span> Enable";
  document.getElementById("btn-bid-confirm").disabled = true;

  erc20Contract.on("Approval", async (owner, spender, value) => {
    if (owner === await signer.getAddress()) {
      setBtnBid();
    }
  });
};

const checkApproveAllERC20 = async () => {
  let allowance = 0;
  const erc20Contract = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, provider);

  await erc20Contract.allowance(await signer.getAddress(), MARKETPLACE_ADDRESS).then((response) => {
    allowance = response;
  });

  return allowance.gt(0);
};

const verifySignature = async (signature, auction) => {
  const expectedSignerAddress = await signer.getAddress();
  const recoveredAddress = ethers.utils.verifyTypedData(domain, types, auction, signature);
};

const splitSignature = (signature) => {
  const expanded = ethers.utils.splitSignature(signature);

  console.log(expanded);
};

const createBid = async () => {
  const signerAddress = await signer.getAddress();
  const elementId = document.getElementById("currentBidElementId").value;
  const bidedNft = auctionNFTs.find((nft) => nft.elementId === elementId);

  if (document.getElementById("auction-bid").value === "" || document.getElementById("auction-bid").value === undefined) {
    document.getElementById("passwordHelpInline").classList.add("text-danger");
    return;
  }
  const newBid = ethers.utils.parseEther(document.getElementById("auction-bid").value);

  if (newBid.lte(ethers.BigNumber.from(bidedNft.minimumBid))) {
    document.getElementById("passwordHelpInline").classList.add("text-danger");
    return;
  }
  document.getElementById("passwordHelpInline").classList.remove("text-danger");

  const data = {
    tokenId: parseInt(bidedNft.tokenId),
    contractAddress: bidedNft.contract,
    ownerAddress: bidedNft.owner,
    bidderAddress: signerAddress,
    bid: newBid,
  };
  const signature = await signer._signTypedData(domain, typeBid, data);

  await axios.post(`/auction/bid/${elementId}/${newBid}/${signature}/${signerAddress}`, {
  })
    .then((response) => {
      auctionNFTs = response.data;

      refreshAuctionList(auctionNFTs);

      bidModal.hide();
    })
    .catch((error) => {
      console.log("auction.createBid: Cannot add new nft to the auction", error);
    });
};

const setBtnBid = async () => {
  const btn = document.getElementById("btn-bid-confirm");
  if (await checkApproveAllERC20()) {
    btn.onclick = createBid;
    btn.innerHTML = "Bid";
    btn.disabled = false;
  } else {
    btn.onclick = approveERC20;
    btn.innerHTML = "Enable";
  }
};

const bid = async (elementId) => {
  const bidedNft = auctionNFTs.find((nft) => nft.elementId === elementId);
  document.getElementById("minimum-bid-for-item").innerHTML = ethers.utils.formatEther(bidedNft.minimumBid);
  document.getElementById("currentBidElementId").value = elementId;

  await setBtnBid();

  bidModal.show();
};

const confirmBid = async (elementId) => {
  const bidedNft = auctionNFTs.find((nft) => nft.elementId === elementId);
  const signerAddress = await signer.getAddress();
  const data = {
    tokenId: parseInt(bidedNft.tokenId),
    contractAddress: bidedNft.contract,
    ownerAddress: bidedNft.owner,
    bidderAddress: bidedNft.buyer,
    bid: bidedNft.buyerBid,
  };

  if (signerAddress !== bidedNft.owner) { return; }

  const signature = await signer._signTypedData(domain, typeBid, data);

  await axios.post(`/auction/confirm/bid/${elementId}/${signature}/${signerAddress}`, {
  })
    .then(async (response) => {
      auctionNFTs = response.data;
      await refreshAuctionList(auctionNFTs);
    })
    .catch((error) => {
      console.log("auction.confirmBid: Cannot add new nft to the auction", error);
    });
};

const trade = async (elementId) => {
  const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
  const contractWithSigner = marketplaceContract.connect(signer);
  const bidedNft = auctionNFTs.find((nft) => nft.elementId === elementId);

  await contractWithSigner.createMarketSale(
    ERC721_ADDRESS,
    parseInt(bidedNft.tokenId),
    bidedNft.owner,
    bidedNft.buyer,
    bidedNft.buyerBid,
    ERC20_ADDRESS,
  );

  document.getElementById("btn-trade").disabled = true;
  document.getElementById("btn-trade").innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span> Trade";
  marketplaceContract.on("CreateMarketSale", async (erc721Address, tokenId, sellerAddress, buyerAddress, sellAmount, erc20Address) => {
    await finishAuction(bidedNft.elementId);
  });
};

const finishAuction = async (elementId) => {
  await axios.post(`/auction/finish/${elementId}`, {
  })
    .then(async (response) => {
      auctionNFTs = response.data;
      await refreshAuctionList(auctionNFTs);
    })
    .catch((error) => {
      console.log("auction.finishAuction: Cannot add new nft to the auction", error);
    });
};

const setAuctionButton = async () => {
  const btn = document.getElementById("auction-btn");
  if (await checkApproveAllERC721()) {
    btn.onclick = prepareAuction;
    btn.innerHTML = "New Auction";
    btn.disabled = false;
  } else {
    btn.onclick = approveAllERC721;
    btn.innerHTML = "Enable Auction";
  }
};

const initialSetup = async () => {
  // Pedir si tiene el all aproval
  await setAuctionButton();
  // mostrar boton A o B
};

document.addEventListener("DOMContentLoaded", async (event) => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);

    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    chainId = await provider.getNetwork();
    domain = {
      name: "Cheap NFT Marketplace",
      version: "1",
      chainId: chainId.chainId,
      verifyingContract: MARKETPLACE_ADDRESS,
    };
    await initialSetup();
    getListedNfts();
  } else {
    console.error("Install Metamask");
  }
});
