import { WebSocketMessage } from '@punchcontrol/shared/websocket-dto';
import { Service } from 'typedi';
import * as WebSocket from 'ws';
import { LOGGING } from '../util/logging';
import { Application } from 'express';
import { Server } from 'http';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class WebSocketController {

    private wss: WebSocket.Server;

    constructor() {
    }

    /**
     * Initialize the web-socket server
     */
    initialize(server: Server) {
        this.wss = new WebSocket.Server({ server: server });

        this.wss.on('connection', (ws: WebSocket) => {
            ws.on('message', (message: string) => {
                LOGGER.debug(() => `Received ${message}`);
                const wsMsg: WebSocketMessage = JSON.parse(message);
                if (wsMsg.path === '/protocol/authorization') {
                    // TODO: implement auth...
                    const resp: WebSocketMessage = { path: '/protocol/authorization', body: 'fakecid' }
                    ws.send(JSON.stringify(resp));
                }
            });
        });
    }
    /**
     * Broadcasts to all connected clients
     * @param data the message to send
     */
    broadcast(data: WebSocketMessage) {
        const str = JSON.stringify(data);
        LOGGER.debug(() => `Broadcasting to ${this.wss.clients.size} clients: ${str}`);
        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(str);
            }
        });
    };
}
