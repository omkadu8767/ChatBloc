const Message = require("../models/Message");
const User = require("../models/User");
const { encryptMessage, decryptMessage, hashMessage } = require("../utils/cryptoUtils");
const { storeHashOnChain, getHashFromChain } = require("../config/blockchain");

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
        const blockchainIndex = await storeHashOnChain(hash);

        const createdMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            encryptedMessage,
            hash,
            blockchainIndex,
        });

        const io = req.app.get("io");
        io.to(String(receiverId)).emit("new_message", {
            id: createdMessage._id,
            sender: senderId,
            receiver: receiverId,
            encryptedMessage,
            timestamp: createdMessage.timestamp,
        });

        res.status(201).json({
            success: true,
            message: "Message sent securely",
            data: {
                id: createdMessage._id,
                encryptedMessage,
                hash,
                blockchainIndex,
                timestamp: createdMessage.timestamp,
            },
        });
    } catch (error) {
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

        const decryptedMessage = decryptMessage(message.encryptedMessage);
        const recomputedHash = hashMessage(decryptedMessage);
        const chainHash = await getHashFromChain(message.blockchainIndex);

        const valid = recomputedHash === chainHash;

        res.status(200).json({
            success: true,
            data: {
                messageId,
                valid,
                recomputedHash,
                blockchainHash: chainHash,
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
