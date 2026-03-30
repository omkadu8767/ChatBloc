const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const messageHashStorageAbi = require("../blockchain/messageHashStorageAbi");

let contract;

function ensureHexPrefix(value) {
    if (!value) {
        return value;
    }

    return value.startsWith("0x") ? value : `0x${value}`;
}

function resolveContractAddress() {
    if (process.env.CONTRACT_ADDRESS) {
        return process.env.CONTRACT_ADDRESS;
    }

    const deploymentPath = path.resolve(
        __dirname,
        "../../../blockchain/deployments/local.json"
    );

    if (fs.existsSync(deploymentPath)) {
        const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
        if (deployment.contractAddress) {
            return deployment.contractAddress;
        }
    }

    return null;
}

function getContract() {
    if (contract) {
        return contract;
    }

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    const privateKey = ensureHexPrefix(process.env.BLOCKCHAIN_PRIVATE_KEY || "");
    const contractAddress = ensureHexPrefix(resolveContractAddress() || "");

    if (!privateKey) {
        throw new Error("BLOCKCHAIN_PRIVATE_KEY is not set");
    }

    if (!contractAddress) {
        throw new Error("Contract address not found. Set CONTRACT_ADDRESS or deploy contract.");
    }

    if (!ethers.isHexString(privateKey, 32)) {
        throw new Error("BLOCKCHAIN_PRIVATE_KEY must be a valid 32-byte hex private key");
    }

    if (!ethers.isAddress(contractAddress)) {
        throw new Error("CONTRACT_ADDRESS must be a valid Ethereum address");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, messageHashStorageAbi, wallet);

    return contract;
}

async function storeHashOnChain(hash) {
    const chainContract = getContract();
    const tx = await chainContract.storeHash(hash);
    const receipt = await tx.wait();

    const hashStoredEvent = receipt.logs
        .map((log) => {
            try {
                return chainContract.interface.parseLog(log);
            } catch (_error) {
                return null;
            }
        })
        .find((parsed) => parsed && parsed.name === "HashStored");

    if (!hashStoredEvent) {
        throw new Error("HashStored event not found in transaction receipt");
    }

    return Number(hashStoredEvent.args.index);
}

async function getHashFromChain(index) {
    const chainContract = getContract();
    return chainContract.getHash(index);
}

module.exports = {
    storeHashOnChain,
    getHashFromChain,
};
