require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: "0.8.24",
    networks: {
        localhost: {
            url: process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545",
            accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : undefined,
        },
    },
};
