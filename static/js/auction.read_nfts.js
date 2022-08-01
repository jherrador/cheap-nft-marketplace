// const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

// Using HTTP
const web3 = createAlchemyWeb3(
  "https://polygon-mainnet.g.alchemy.com/v2/WWJwKWkSCfJISmjtheW46Dz1Zbti0VLA",
);

const main = async () => {
  // Wallet address (Supports ENS!)
  const address = "0x3eAdEfb36946DaFa1a11C8A0fDaEb49db08ff411";

  // Get all NFTs
  const nfts = await
  web3.alchemy.getNfts({ owner: address });

  // Print NFTs
  console.log(nfts);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
