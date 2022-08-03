let chainId;
let domain;

const verifySignature = async (signature, auction) => {
  const expectedSignerAddress = await signer.getAddress();
  const recoveredAddress = ethers.utils.verifyTypedData(domain, SIGNATURE_TYPE_LIST, auction, signature);
};

const splitSignature = (signature) => {
  const expanded = ethers.utils.splitSignature(signature);

  console.log(expanded);
};

const setDomain = async (provider) => {
  chainId = await provider.getNetwork();
  domain = {
    name: "Cheap NFT Marketplace",
    version: "1",
    chainId: chainId.chainId,
    verifyingContract: MARKETPLACE_ADDRESS,
  };
};

const requestListSignature = async (tokenId, contractAddress, minbid) => {
  const data = {
    tokenId,
    contractAddress,
    minimumBid: minbid,
  };

  return await signer._signTypedData(domain, SIGNATURE_TYPE_LIST, data);
};

const requestBidSignature = async (tokenId, contract, owner, signerAddress, newBid) => {
  const data = {
    tokenId,
    contractAddress: contract,
    ownerAddress: owner,
    bidderAddress: signerAddress,
    bid: newBid,
  };
  return await signer._signTypedData(domain, SIGNATURE_TYPE_BID, data);
};
