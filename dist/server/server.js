"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
let chatHistories = [];
const app = express();
//initialize a simple http server
const server = http.createServer(app);
//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
    const extWs = ws;
    extWs.isAlive = true;
    ws.on('pong', () => {
        extWs.isAlive = true;
        console.log('--normalpong');
    });
    //connection is up, let's add a simple event
    ws.on('message', (msg) => {
        console.log('recevied %s', msg);
        const jMsg = JSON.parse(msg);
        if (jMsg.type && jMsg.type === 'ping') {
            ws.send({ type: 'pong' });
            return;
        }
        if (jMsg.msg === 'reconnecting') {
            //reconnected client, send all histories currently but we need some logic for data transfer
            ws.send(JSON.stringify({ msg: 'connected', history: chatHistories }));
            console.log('connected');
        }
        else {
            if (jMsg.action === 0) {
                //send histories to new client
                ws.send(JSON.stringify({ msg: 'connected', history: chatHistories }));
                console.log('connected');
            }
            else if (jMsg.action === 2) {
                //user changed username, will need modification process for all clients
                console.log('user changed username');
            }
            else {
                chatHistories.push(jMsg);
                ws.send(msg);
                setTimeout(() => {
                    //send back the message to the other clients
                    wss.clients
                        .forEach(client => {
                        if (client !== ws) {
                            client.send(msg);
                        }
                    });
                }, 1000);
            }
        }
    });
    //new client connected
    console.warn('Client connected');
    ws.on('error', (err) => {
        console.warn(`Client disconnected - reason: ${err}`);
    });
});
// remove unconnected clients
setInterval(() => {
    wss.clients.forEach((ws) => {
        const extWs = ws;
        if (!extWs.isAlive)
            return ws.terminate();
        //check client is alive
        extWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);
//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
//# sourceMappingURL=server.js.map