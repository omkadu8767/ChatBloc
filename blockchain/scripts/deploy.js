const fs = require("fs");
const path = require("path");

async function main() {
    const MessageHashStorage = await ethers.getContractFactory("MessageHashStorage");
    const contract = await MessageHashStorage.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log(`MessageHashStorage deployed to: ${contractAddress}`);

    const deploymentsDir = path.resolve(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentData = {
        network: network.name,
        contractAddress,
        deployedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
        path.join(deploymentsDir, "local.json"),
        JSON.stringify(deploymentData, null, 2)
    );

    console.log("Deployment data written to blockchain/deployments/local.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
