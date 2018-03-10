import { startup } from './server';
import {join as pathJoin} from 'path';

startup(pathJoin(__dirname, '..', '..', 'client', 'dist'))
    .then(() => console.log(`Done`))
    .catch((err: Error) => console.error(err));;
