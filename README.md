# NFT Marketplace Smart Contracts

This project that contains a cheap NFT MarketPlace with EIP-712 Signatures. 
Is necessary to deploy de smart contracts of project https://github.com/jherrador/cheap-nft-marketplace-contracts

Remember to create a .env file using .env.example as template. If you want you can use the next config to check it on rinkeby.

```shell
PORT=3000
APP_NAME=Cheap NFT Marketplace
PROVIDER=https://eth-rinkeby.alchemyapi.io/v2/WWJwKWkSCfJISmjtheW46Dz1Zbti0VLA
MARKETPLACE_CONTRACT=0x08a01AE2547c67B7ece24BcCeabB61159675c6bF
```

To run the project you need to run the following commands:

Install dependencies
```shell
npm install
```

Run the WebServer
```shell
npx nodemon app.js
```