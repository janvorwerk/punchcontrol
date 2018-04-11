import { WebSocketMessage } from '@punchcontrol/shared/websocket-dto';
import { Service } from 'typedi';
import * as WebSocket from 'ws';
import { ExpressController } from './express.controller';
import { LOGGING } from '../util/logging';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class WebSocketController {

    private wss: WebSocket.Server;

    constructor(private expressCtrl: ExpressController) {
    }

    /**
     * Initialize the web-socket server
     */
    initialize() {
        this.wss = new WebSocket.Server({ server: this.expressCtrl.server });

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
