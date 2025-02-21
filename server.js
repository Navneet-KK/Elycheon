const WebSocket = require("ws");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get("/", (req, res) => {
    res.send("WebSocket server is running!");
});

wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "chat") {
                console.log("Message received:", data.message);

                // Broadcast message to all clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "chat", message: data.message }));
                    }
                });
            }
        } catch (error) {
            console.error("Error parsing message:", error);
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});
