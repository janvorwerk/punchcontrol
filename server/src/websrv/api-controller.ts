import { Service } from 'typedi';
import { DatabaseController } from '../db/database-controller';
import { LOGGING } from '../util/logging';
import { AdminApiController } from './admin-api';
import { ExpressContoller } from './express-controller';
import { DatabaseApiController } from './generic-db-api';
import { RacesApiController } from './races-api';
import { TeamMembersApiController } from './team-members-api';
import { WebSocketController } from './websocket-controller';

const LOGGER = LOGGING.getLogger(__filename);

/**
 * This is the entry point of the API configuration
 */
@Service()
export class ApiConfiguratorController {

    constructor(
        private databaseCtrl: DatabaseController,
        private expressCtrl: ExpressContoller,
        private webSocketCtrl: WebSocketController,
        private teamMembersApiCtrl: TeamMembersApiController,
        private racesApiCtrl: RacesApiController,
        private adminApiCtrl: AdminApiController,
        private databaseApiCtrl: DatabaseApiController) {

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

