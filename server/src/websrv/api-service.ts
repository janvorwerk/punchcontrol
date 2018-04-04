import { Service } from 'typedi';
import { SrvDatabaseService } from '../db/database-service';
import { LOGGING } from '../util/logging';
import { SrvAdminApiService } from './admin-api';
import { SrvExpressService } from './express-service';
import { SrvDatabaseApiService } from './generic-db-api';
import { SrvRacesApiService } from './races-api';
import { SrvTeamMembersApiService } from './team-members-api';
import { SrvWebSocketService } from './websocket-service';

const LOGGER = LOGGING.getLogger(__filename);

/**
 * This is the entry point of the API configuration
 */
@Service()
export class SrvApiConfiguratorService {

    constructor(
        private databaseService: SrvDatabaseService,
        private expressService: SrvExpressService,
        private webSocketService: SrvWebSocketService,
        private teamMembersApi: SrvTeamMembersApiService,
        private racesApi: SrvRacesApiService,
        private adminApi: SrvAdminApiService,
        private databaseApi: SrvDatabaseApiService) {

    }

    async initialize() {
        await this.databaseApi.initialize();
        await this.teamMembersApi.initialize();
        await this.racesApi.initialize();
        await this.adminApi.initialize();

        // Once everything set, we can start the Express app
        this.expressService.startListening();
    }
}

