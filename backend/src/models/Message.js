const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        encryptedMessage: {
            type: String,
            required: true,
        },
        hash: {
            type: String,
            required: true,
        },
        blockchainIndex: {
            type: Number,
            default: null,
        },
        blockchainTxHash: {
            type: String,
            default: null,
        },
        chainStatus: {
            type: String,
            enum: ["pending", "confirmed", "failed"],
            default: "pending",
            index: true,
        },
        chainError: {
            type: String,
            default: null,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Message", messageSchema);
