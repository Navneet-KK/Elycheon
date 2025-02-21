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

            // Logging different WebRTC messages
            if (data.type === "offer") console.log("Received WebRTC offer");
            if (data.type === "answer") console.log("Received WebRTC answer");
            if (data.type === "candidate") console.log("Received ICE candidate");

            // Broadcast message to all clients except sender
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });

        } catch (error) {
            console.error("Invalid JSON received:", error);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log("Client disconnected. Total:", clients.size);
    });
});

server.listen(3000, () => console.log('Signaling Server running on ws://localhost:3000'));
