import * as fs from 'fs';
import * as util from 'util';

export const async = {
    readFile: util.promisify(fs.readFile),
    writeFile: util.promisify(fs.writeFile),
}

