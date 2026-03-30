module.exports = [
    "event HashStored(uint256 indexed index, string hash, address indexed sender)",
    "function storeHash(string calldata hash) external returns (uint256)",
    "function getHash(uint256 index) external view returns (string memory)",
    "function getHashCount() external view returns (uint256)",
];
