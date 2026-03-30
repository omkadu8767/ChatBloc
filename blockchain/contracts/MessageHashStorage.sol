// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MessageHashStorage {
    string[] private hashes;

    event HashStored(
        uint256 indexed index,
        string hash,
        address indexed sender
    );

    function storeHash(string calldata hash) external returns (uint256) {
        hashes.push(hash);
        uint256 index = hashes.length - 1;
        emit HashStored(index, hash, msg.sender);
        return index;
    }

    function getHash(uint256 index) external view returns (string memory) {
        require(index < hashes.length, "Invalid hash index");
        return hashes[index];
    }

    function getHashCount() external view returns (uint256) {
        return hashes.length;
    }
}
