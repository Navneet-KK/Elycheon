const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log("New client connected. Total:", clients.size);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            // Handle different message types
            if (data.type === "offer") {
                console.log("Received WebRTC offer");
                // Send the offer to all clients except the sender
                broadcastMessage(ws, data);
            } else if (data.type === "answer") {
                console.log("Received WebRTC answer");
                // Send the answer to all clients except the sender
                broadcastMessage(ws, data);
            } else if (data.type === "candidate") {
                console.log("Received ICE candidate");
                // Send the ICE candidate to all clients except the sender
                broadcastMessage(ws, data);
            } else if (data.type === "chat") {
                console.log("Received chat message");
                // Broadcast chat message to all clients
                broadcastMessage(ws, data);
            } else {
                console.log("Unknown message type:", data.type);
            }

        } catch (error) {
            console.error("Invalid JSON received:", error);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log("Client disconnected. Total:", clients.size);
    });
});

// Function to broadcast messages to all clients except the sender
function broadcastMessage(senderWs, data) {
    clients.forEach(client => {
        if (client !== senderWs && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Signaling Server running on ws://localhost:${PORT}`));
