import { Service } from 'typedi';
import { DatabaseController } from '../db/database.controller';
import { LOGGING } from '../util/logging';
import { AdminApi } from '../rest/admin.api';
import { ExpressController } from './express.controller';
import { GenericApi } from '../rest/generic.api';
import { RaceApi } from '../rest/races.api';
import { TeamApi } from '../rest/team.api';
import { WebSocketController } from './websocket.controller';

const LOGGER = LOGGING.getLogger(__filename);

/**
 * This is the entry point of the API configuration
 */
@Service()
export class ApiConfigController {

    constructor(
        private databaseCtrl: DatabaseController,
        private expressCtrl: ExpressController,
        private webSocketCtrl: WebSocketController,
        private teamMembersApiCtrl: TeamApi,
        private racesApiCtrl: RaceApi,
        private adminApiCtrl: AdminApi,
        private databaseApiCtrl: GenericApi) {

    }

    async initialize() {
        await this.databaseApiCtrl.initialize();
        await this.teamMembersApiCtrl.initialize();
        await this.racesApiCtrl.initialize();
        await this.adminApiCtrl.initialize();

        // Once everything set, we can start the Express app
        this.expressCtrl.startListening();
    }
}

