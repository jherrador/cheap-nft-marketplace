let provider;
let signer;
const ERC721_ADDRESS = "0x8a45B021A594552D739ad6Bbb23ad31e0448efc3";
const MARKETPLACE_ADDRESS = "0x39Ab72Ecc0CD1D9a36E0cBb89FD499558b55448e";
const DEFAULT_TOKEN_URI = "https://ipfs.io/ipfs/QmdzBhpibPZTPBPL1DPXnv8AvLoAN5TTDzczWw36RoSkoP";

document.addEventListener("DOMContentLoaded", async (event) => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);

    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
  } else {
    console.error("Install Metamask");
  }
});

const addNewItem = async () => {
  console.log("lol");

  // eslint-disable-next-line no-undef
  await axios.post("/auction/new/0xfEEE476CFaf56c2f359A63500415d5a2c7F2F2B9/8459", {
  })
    .then((response) => {
      const { data } = response;
      console.log(data);
      const nftElement = `<li>
        <img src='${data.image}' alt='' style='width:200px;height:200px'/>
        <h1>${data.name}</h1>
        <p>${data.description}</p>
        <p>${data.address}</p>
        <p>${data.price}</p>
        <p>${data.lastUpdate}</p>
        <button>Approve 1</button>
        <button>Buy 2</button>
        <button>Transfer 3</button>
        </li>`;

      document.getElementById("listed_nfts").innerHTML += nftElement;
    })
    .catch((error) => {
      console.log("auction.addNewItem: Cannot add new nft to the auction", error);
    });
};

const signListing = async () => {
  const messageHash = await signer.signMessage("Publish your NFT in the marketplace");

  console.log("Message Hash: ", messageHash);
  console.log("from signer ", signer);

  console.log("SIGNATURE", messageHash);
};

const listAllNfts = async () => {
  const web3 = AlchemyWeb3.createAlchemyWeb3(
    "https://eth-rinkeby.alchemyapi.io/v2/WWJwKWkSCfJISmjtheW46Dz1Zbti0VLA",
  );
  // Get all NFTs using alchemy
  const nfts = await web3.alchemy.getNfts({ owner: await signer.getAddress() });

  return nfts.ownedNfts;
};

const prepareAuction = async () => {
  const myModal = new bootstrap.Modal(document.getElementById("create-auction-modal"));
  myModal.show();
  const nfts = await listAllNfts();
  document.getElementById("create-auction-modal-loader").style.visibility = "hidden";
  nfts.forEach((nft) => {
    appendNFTToList(nft);
  });
  console.log(nfts);
};

const appendNFTToList = (nft) => {
  const nftElement = `<div class="col-4 mb-5">
    <img src='${nft.media[0].gateway}' alt='' class="img-fluid"/>
    <h5 class="text-center">${nft.title} ${parseInt(nft.id.tokenId) > 10000 ? "" : `#${parseInt(nft.id.tokenId)}`}</h5>
    <button class="btn btn-primary">Approve 1</button>
    <button class="btn btn-primary">Buy 2</button>
    <button class="btn btn-primary">Transfer 3</button></div>`;

  document.getElementById("owner_nfts").innerHTML += nftElement;
};

const mint = () => {
  const erc721Contract = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, provider);
  const contractWithSigner = erc721Contract.connect(signer);
  console.log(signer.address);
  contractWithSigner.createCollectible(signer.getAddress(), DEFAULT_TOKEN_URI);
};

const approveAll = () => {
  const erc721Contract = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, provider);
  const contractWithSigner = erc721Contract.connect(signer);

  contractWithSigner.setApprovalForAll(MARKETPLACE_ADDRESS, true);
};
