require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

function startServer() {
    const port = process.env.PORT || 5000;

    connectDB();

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        socket.on("join", (userId) => {
            if (userId) {
                socket.join(String(userId));
            }
        });

        socket.on("disconnect", () => {
            // Socket.io automatically handles room cleanup on disconnect.
        });
    });

    app.set("io", io);

    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = { startServer };
