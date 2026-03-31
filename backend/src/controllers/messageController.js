const Message = require("../models/Message");
const User = require("../models/User");
const { encryptMessage, decryptMessage, hashMessage } = require("../utils/cryptoUtils");
const { submitHashTransaction, getHashFromChain } = require("../config/blockchain");

async function sendMessage(req, res, next) {
    try {
        const senderId = req.user.id;
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            const error = new Error("receiverId and message are required");
            error.statusCode = 400;
            throw error;
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            const error = new Error("Receiver not found");
            error.statusCode = 404;
            throw error;
        }

        const encryptedMessage = encryptMessage(message);
        const hash = hashMessage(message);
        const pendingTx = await submitHashTransaction(hash);

        const createdMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            encryptedMessage,
            hash,
            blockchainIndex: null,
            blockchainTxHash: pendingTx.txHash,
            chainStatus: "pending",
        });

        pendingTx
            .waitForIndex()
            .then(async (blockchainIndex) => {
                await Message.findByIdAndUpdate(createdMessage._id, {
                    blockchainIndex,
                    chainStatus: "confirmed",
                    chainError: null,
                });

                const io = req.app.get("io");
                io.to(String(senderId)).to(String(receiverId)).emit("message_chain_update", {
                    id: String(createdMessage._id),
                    sender: String(senderId),
                    receiver: String(receiverId),
                    chainStatus: "confirmed",
                    blockchainIndex,
                    chainError: null,
                });
            })
            .catch(async (error) => {
                await Message.findByIdAndUpdate(createdMessage._id, {
                    chainStatus: "failed",
                    chainError: error.message,
                });

                const io = req.app.get("io");
                io.to(String(senderId)).to(String(receiverId)).emit("message_chain_update", {
                    id: String(createdMessage._id),
                    sender: String(senderId),
                    receiver: String(receiverId),
                    chainStatus: "failed",
                    blockchainIndex: null,
                    chainError: error.message,
                });
            });

        const io = req.app.get("io");
        io.to(String(receiverId)).to(String(senderId)).emit("new_message", {
            id: createdMessage._id,
            sender: String(senderId),
            receiver: String(receiverId),
            encryptedMessage,
            chainStatus: createdMessage.chainStatus,
            blockchainTxHash: createdMessage.blockchainTxHash,
            timestamp: createdMessage.timestamp,
        });

        res.status(201).json({
            success: true,
            message: "Message sent securely and submitted to blockchain",
            data: {
                id: createdMessage._id,
                encryptedMessage,
                hash,
                blockchainIndex: createdMessage.blockchainIndex,
                blockchainTxHash: createdMessage.blockchainTxHash,
                chainStatus: createdMessage.chainStatus,
                timestamp: createdMessage.timestamp,
            },
        });
    } catch (error) {
        const message = String(error.message || "").toLowerCase();
        const code = String(error.code || "").toUpperCase();

        if (code === "INSUFFICIENT_FUNDS" || message.includes("insufficient funds")) {
            error.statusCode = 503;
            error.message = "Blockchain wallet has insufficient funds. Fund the backend signer wallet on Sepolia and retry.";
        }

        next(error);
    }
}

async function getMessagesByUser(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId },
            ],
        })
            .sort({ timestamp: 1 })
            .lean();

        const response = messages.map((item) => {
            const decryptedMessage = decryptMessage(item.encryptedMessage);
            return {
                id: item._id,
                sender: item.sender,
                receiver: item.receiver,
                encryptedMessage: item.encryptedMessage,
                decryptedMessage,
                hash: item.hash,
                blockchainIndex: item.blockchainIndex,
                blockchainTxHash: item.blockchainTxHash,
                chainStatus: item.chainStatus,
                chainError: item.chainError,
                timestamp: item.timestamp,
            };
        });

        res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        next(error);
    }
}

async function verifyMessage(req, res, next) {
    try {
        const { messageId } = req.body;

        if (!messageId) {
            const error = new Error("messageId is required");
            error.statusCode = 400;
            throw error;
        }

        const message = await Message.findById(messageId);

        if (!message) {
            const error = new Error("Message not found");
            error.statusCode = 404;
            throw error;
        }

        if (message.chainStatus === "pending" || message.blockchainIndex === null || message.blockchainIndex === undefined) {
            return res.status(200).json({
                success: true,
                data: {
                    messageId,
                    valid: null,
                    verificationStatus: "pending",
                    recomputedHash: null,
                    blockchainHash: null,
                    verificationError: "On-chain confirmation is pending",
                },
            });
        }

        if (message.chainStatus === "failed") {
            return res.status(200).json({
                success: true,
                data: {
                    messageId,
                    valid: null,
                    verificationStatus: "failed",
                    recomputedHash: null,
                    blockchainHash: null,
                    verificationError: message.chainError || "On-chain hash write failed",
                },
            });
        }

        const decryptedMessage = decryptMessage(message.encryptedMessage);
        const recomputedHash = hashMessage(decryptedMessage);

        let chainHash = null;
        let valid = false;
        let verificationError = null;

        try {
            chainHash = await getHashFromChain(message.blockchainIndex);
            valid = recomputedHash === chainHash;
        } catch (error) {
            verificationError = error.message;
        }

        res.status(200).json({
            success: true,
            data: {
                messageId,
                valid,
                verificationStatus: valid ? "verified" : "tampered",
                recomputedHash,
                blockchainHash: chainHash,
                verificationError,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    sendMessage,
    getMessagesByUser,
    verifyMessage,
};
