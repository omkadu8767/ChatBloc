const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

function getAesKey() {
    const secret = process.env.ENCRYPTION_SECRET;

    if (!secret) {
        throw new Error("ENCRYPTION_SECRET is not set");
    }

    return crypto.createHash("sha256").update(secret).digest();
}

function encryptMessage(plainText) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getAesKey(), iv);

    const encrypted = Buffer.concat([
        cipher.update(plainText, "utf8"),
        cipher.final(),
    ]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptMessage(payload) {
    const [ivHex, encryptedHex] = payload.split(":");

    if (!ivHex || !encryptedHex) {
        throw new Error("Invalid encrypted payload format");
    }

    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, getAesKey(), iv);
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}

function hashMessage(message) {
    return crypto.createHash("sha256").update(message).digest("hex");
}

module.exports = {
    encryptMessage,
    decryptMessage,
    hashMessage,
};
