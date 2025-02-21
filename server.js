const WebSocket = require("ws");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get("/", (req, res) => {
    res.send("WebSocket & WebRTC signaling server is running!");
});

// Store connected clients
const clients = new Set();

wss.on("connection", (ws) => {
    console.log("New client connected");
    clients.add(ws);

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "chat") {
                console.log("Chat message:", data.message);

                // Broadcast chat messages to all clients
                clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "chat", message: data.message }));
                    }
                });
            } 
            else if (data.type === "offer" || data.type === "answer" || data.type === "candidate") {
                console.log(`WebRTC ${data.type} received`);
                
                // Forward WebRTC signaling messages
                clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        clients.delete(ws);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`WebSocket & WebRTC signaling server running on port ${PORT}`);
});
