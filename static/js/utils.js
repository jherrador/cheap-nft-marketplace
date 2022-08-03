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

const checkApproveAllERC721 = async () => {
  const erc721Contract = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, provider);
  const contractWithSigner = erc721Contract.connect(signer);

  return await contractWithSigner.isApprovedForAll(await signer.getAddress(), MARKETPLACE_ADDRESS);
};

const checkApproveAllERC20 = async () => {
  let allowance = 0;
  const erc20Contract = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, provider);

  await erc20Contract.allowance(await signer.getAddress(), MARKETPLACE_ADDRESS).then((response) => {
    allowance = response;
  });

  return allowance.gt(0);
};
