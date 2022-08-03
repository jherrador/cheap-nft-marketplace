const web3 = AlchemyWeb3.createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/WWJwKWkSCfJISmjtheW46Dz1Zbti0VLA",
);
const createAuction = new bootstrap.Modal(document.getElementById("create-auction-modal"));
const bidModal = new bootstrap.Modal(document.getElementById("bid-modal"));
let provider;
let signer;
let auctionNFTs = [];

const initialSetup = async () => {
  // Pedir si tiene el all aproval
  await setAuctionButton();
  // mostrar boton A o B
};

const setAuctionButton = async () => {
  const btn = document.getElementById("auction-btn");
  if (await checkApproveAllERC721()) {
    btn.onclick = setupNewListing;
    btn.innerHTML = "New Auction";
    btn.disabled = false;
  } else {
    btn.onclick = approveAllERC721;
    btn.innerHTML = "Enable Auction";
  }
};

const refreshAuctionList = (nfts) => {
  document.getElementById("listed_nfts").innerHTML = "";
  if (nfts.length <= 0) {
    return;
  }
  document.getElementById("listed-nft").style.display = "inline";

  nfts.forEach(async (nft) => {
    const button = "";
    const signerAddress = await signer.getAddress();

    const nftElement = `
    <div class="col-xl-3 col-md-4 col-sm-6 mb-5">
      <div class="card">
        <img src='${nft.image}' alt='' class="img-fluid px-3 py-3"/>
        <div class="card-body">
          <h5 class="card-title">${nft.name} ${parseInt(nft.tokenId) > 10000 ? "" : `#${parseInt(nft.tokenId)}`}</h5>
          ${getNFTButtonStatus(nft, signerAddress)}
        </div>
      </div>
    </div>`;

    document.getElementById("listed_nfts").innerHTML += nftElement;
  });
};

const backendCall = async (url) => {
  await axios.post(url, {
  })
    .then(async (response) => {
      auctionNFTs = response.data;
      await refreshAuctionList(auctionNFTs);
    })
    .catch((error) => {
      console.log("auction.backendCall:", error);
    });
};

const getListedNfts = async () => {
  await backendCall("/auction/listedItems/");
};

const addNFT = async (contractAddress, tokenId, hashId) => {
  let minbid = document.getElementById("auction-min-bid").value;
  const btnItem = document.getElementById(`btn-nft-${hashId}`);
  const minBidRequiredText = document.getElementById("min-bid-required-text");

  if (minbid === undefined || minbid === "" || minbid <= 0) {
    minBidRequiredText.classList.remove("d-none");
    return;
  }
  minbid = ethers.utils.parseEther(minbid);

  minBidRequiredText.classList.add("d-none");

  const signature = await requestListSignature(tokenId, contractAddress, minbid);

  btnItem.innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span> Select";
  btnItem.disabled = true;

  await backendCall(`/auction/new/${contractAddress}/${tokenId}/${minbid}/${signature}/${await signer.getAddress()}`);
  createAuction.hide();
};

const getAllOwnedNFTs = async () => {
  const nfts = await web3.alchemy.getNfts({ owner: await signer.getAddress() });

  return nfts.ownedNfts;
};

const fillOwnedNFTsList = (nfts) => {
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
};

const setupNewListing = async () => {
  const auctionForm = document.getElementById("auction-form");
  const ownerNftsList = document.getElementById("owner_nfts");
  const inputMinBid = document.getElementById("auction-min-bid");
  const nfts = await getAllOwnedNFTs();

  auctionForm.style.display = "none";
  ownerNftsList.innerHTML = "";
  inputMinBid.value = "";

  createAuction.show();

  if (nfts.length === 0 || nfts === undefined) {
    ownerNftsList.innerHTML = "<button class=\"btn btn-primary\" onclick=\"mint()\">Mint NFT </button>";
  } else {
    auctionForm.style.display = "inline";
  }

  fillOwnedNFTsList(nfts);

  if (ownerNftsList.innerHTML === "") {
    auctionForm.style.display = "none";
    ownerNftsList.innerHTML = "<button class=\"btn btn-primary\" onclick=\"mint()\">Mint NFT </button>";
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
        <button id="btn-nft-${nft.contract.address}${nft.id.tokenId}" class="btn btn-primary stretched-link w-100" onclick="addNFT('${nft.contract.address}', ${parseInt(nft.id.tokenId)}, '${nft.contract.address}${nft.id.tokenId}')">Select</button>
      </div>
    </div>
  </div>`;

  document.getElementById("owner_nfts").innerHTML += nftElement;
};

const createBid = async () => {
  const signerAddress = await signer.getAddress();
  const elementId = document.getElementById("currentBidElementId").value;
  const passwordHelpInlineElement = document.getElementById("passwordHelpInline");
  const auctionBidElement = document.getElementById("auction-bid");
  const newBid = ethers.utils.parseEther(auctionBidElement.value);
  const bidedNft = auctionNFTs.find((nft) => nft.elementId === elementId);

  passwordHelpInlineElement.classList.remove("text-danger");

  if (auctionBidElement.value === "" || auctionBidElement.value === undefined || newBid.lte(ethers.BigNumber.from(bidedNft.minimumBid))) {
    passwordHelpInlineElement.classList.add("text-danger");
    return;
  }

  const signature = await requestBidSignature(parseInt(bidedNft.tokenId), bidedNft.contract, bidedNft.owner, signerAddress, newBid);

  await backendCall(`/auction/bid/${elementId}/${newBid}/${signature}/${signerAddress}`);
  bidModal.hide();
};

const getNFTButtonStatus = (nft, signerAddress) => {
  let button = "";
  if (nft.status === "listed") {
    if (signerAddress === nft.owner) {
      button = "<button class=\"btn btn-white stretched-link w-100\" disabled>Your NFT</button>";
    } else {
      button = `<button class="btn btn-primary stretched-link w-100" onclick="setupNewBid('${nft.elementId}')">Bid</button>`;
    }
  } else if (nft.status === "bidded") {
    if (signerAddress === nft.owner) {
      button = `<button class="btn btn-primary stretched-link w-100" onclick="confirmBid('${nft.elementId}')">Confirm Bid</button>`;
    } else {
      button = "<button class=\"btn btn-white stretched-link w-100\" onclick=\"\" disabled>Already Bidded</button>";
    }
  } else if (nft.status === "confirmed") {
    if (signerAddress === nft.owner || signerAddress === nft.buyer) {
      button = `<button class="btn btn-primary stretched-link w-100" onclick="executeTrade('${nft.elementId}')" id="btn-trade">Trade</button>`;
    } else {
      button = "<button class=\"btn btn-white stretched-link w-100\" onclick=\"\" disabled>Unavailable</button>";
    }
  } else if (nft.status === "finished") {
    button = "<button class=\"btn btn-white stretched-link w-100\" disabled>Finished</button>";
  }

  return button;
};

const setBtnBid = async () => {
  const btnBidConfirmElement = document.getElementById("btn-bid-confirm");
  if (await checkApproveAllERC20()) {
    btnBidConfirmElement.onclick = createBid;
    btnBidConfirmElement.innerHTML = "Bid";
    btnBidConfirmElement.disabled = false;
  } else {
    btnBidConfirmElement.onclick = approveERC20;
    btnBidConfirmElement.innerHTML = "Enable";
  }
};

const setupNewBid = async (elementId) => {
  const bidedNft = auctionNFTs.find((nft) => nft.elementId === elementId);
  document.getElementById("minimum-bid-for-item").innerHTML = ethers.utils.formatEther(bidedNft.minimumBid);
  document.getElementById("currentBidElementId").value = elementId;

  await setBtnBid();

  bidModal.show();
};

const confirmBid = async (elementId) => {
  const bidedNft = auctionNFTs.find((nft) => nft.elementId === elementId);
  const signerAddress = await signer.getAddress();

  if (signerAddress !== bidedNft.owner) { return; }

  const signature = await requestBidSignature(parseInt(bidedNft.tokenId), bidedNft.contract, bidedNft.owner, bidedNft.buyer, bidedNft.buyerBid);

  await backendCall(`/auction/confirm/bid/${elementId}/${signature}/${signerAddress}`);
};

const executeTrade = async (elementId) => {
  const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
  const contractWithSigner = marketplaceContract.connect(signer);
  const bidedNft = auctionNFTs.find((nft) => nft.elementId === elementId);
  const btnTradeElement = document.getElementById("btn-trade");

  await contractWithSigner.createMarketSale(
    ERC721_ADDRESS,
    parseInt(bidedNft.tokenId),
    bidedNft.owner,
    bidedNft.buyer,
    bidedNft.buyerBid,
    ERC20_ADDRESS,
  );
  marketplaceContract.on("CreateMarketSale", async () => {
    await finishAuction(bidedNft.elementId);
  });

  btnTradeElement.disabled = true;
  btnTradeElement.innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span> Trade";
};

const finishAuction = async (elementId) => {
  await backendCall(`/auction/finish/${elementId}`);
};

const approveAllERC721 = () => {
  const erc721Contract = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, provider);
  const contractWithSigner = erc721Contract.connect(signer);
  const auctionBtnElement = document.getElementById("auction-btn");

  contractWithSigner.setApprovalForAll(MARKETPLACE_ADDRESS, true);

  auctionBtnElement.innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span> Enable Auction";
  auctionBtnElement.disabled = true;

  erc721Contract.on("ApprovalForAll", async (owner, operator) => {
    if (owner === await signer.getAddress() && operator === MARKETPLACE_ADDRESS) {
      await setAuctionButton();
    }
  });
};

const approveERC20 = async () => {
  const btnBidConfirmElement = document.getElementById("btn-bid-confirm");
  const erc20Contract = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, provider);
  const contractWithSigner = erc20Contract.connect(signer);

  contractWithSigner.approve(MARKETPLACE_ADDRESS, ethers.constants.MaxUint256);

  btnBidConfirmElement.innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span> Enable";
  btnBidConfirmElement.disabled = true;

  erc20Contract.on("Approval", async (owner) => {
    if (owner === await signer.getAddress()) {
      setBtnBid();
    }
  });
};

const drawWebsite = () => {
  document.getElementById("wallet-container").classList.remove("visible");
  document.getElementById("wallet-container").classList.add("invisible");
  document.getElementById("page-container").classList.remove("invisible");
  document.getElementById("page-container").classList.add("visible");
};

document.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum) {
    document.getElementById("wallet-container").classList.add("visible");
    document.getElementById("wallet-container").classList.remove("invisible");
    document.getElementById("page-container").classList.add("invisible");
    document.getElementById("page-container").classList.remove("visible");
    provider = new ethers.providers.Web3Provider(window.ethereum);

    await provider.send("eth_requestAccounts", []);
    drawWebsite();
    signer = provider.getSigner();

    setDomain(provider);
    await initialSetup();
    getListedNfts();
  } else {
    location.href = "/";
  }
});

window.ethereum.on("accountsChanged", () => {
  location.reload();
});
