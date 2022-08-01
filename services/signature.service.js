// Deprecated

const signatureService = {};
const { ethers } = require("ethers");

signatureService.verify = async (signature, domain, types, struct, owner) => {
  console.log("BEFORE VERIFY");
  const recoveredAddress = ethers.utils.verifyTypedData(domain, types, struct, signature);
  console.log("AFTER VERIFY");
  console.log(recoveredAddress);
  console.log(owner);
  console.log(recoveredAddress === owner);
  return recoveredAddress === owner;
};

module.exports = signatureService;
