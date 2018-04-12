import { Service } from 'typedi';
import { LOGGING } from '../util/logging';
import { RequestHandler, Response, Application } from 'express';
import { RestApiStatusCodes } from '@punchcontrol/shared/api';
import { ExpressController } from './express.controller';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class AuthController {
    private _electronSecret: string | null = null;
    constructor() {
    }

    initialize(electronSecret?: string) {
        if (electronSecret) {
            this._electronSecret = electronSecret;
            LOGGER.info(`Installing GET handler for /electron`)
        }
    }

    get electronSecret() { return this._electronSecret }

    registerHandlers(app: Application) {
        app.get('/electron', this.electronAuthenticatePage)
    }

    private electronAuthenticatePage: RequestHandler = (req, res) => {
        if (this.electronSecret === 'fakesecret') {
            const ip = req.connection.remoteAddress;
            if (ip === '127.0.0.1' || ip === '::1') {
                LOGGER.warn(`Authorizing dev-mode request on ${req.url} from ${ip}`);
                this.sendElectronPage(res);
                return;
            }
        }
        let auth = req.headers.authorization;
        if (auth == null) {
            LOGGER.warn(`Unauthorized request (no header) on ${req.url}`);
            res.status(RestApiStatusCodes.CLIENT_401_UNAUTHORIZED).send('Missing Authorization header');
            return;
        }
        if (auth instanceof Array) {
            LOGGER.warn(`Too many (${auth.length}) Authorization found on ${req.url}, taking first, ignoring others`);
            auth = auth[0];
        }
        const [kind, token] = auth.split(' ');
        if (kind !== 'Bearer' || token !== this.electronSecret) {
            LOGGER.warn(`Unauthorized request (wrong auth) on ${req.url}`);
            res.status(RestApiStatusCodes.CLIENT_401_UNAUTHORIZED).send('Wrong Authorization header');
        } else {
            this.sendElectronPage(res);
        }
    }
    private sendElectronPage(res: Response) {
        res.status(RestApiStatusCodes.SUCCESS_200_OK).send(`<!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <script>
                    sessionStorage.setItem('user', '__local__');
                    sessionStorage.setItem('auth', '${this.electronSecret}');
                    window.location.replace(window.location.href.replace('/electron', ''));
                </script>
            </head>
            <body>
            </body>
            </html>
        `);
    }
}
