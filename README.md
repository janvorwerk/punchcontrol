# punchcontrol

This project is an orienteering timing software licensed under GPL v3.

The goal is to run a web server (Node/Express) embedded in an Electron desktop app, serving an Angular web app, hence accessible remotely for concurrent management of the race.

## Folders

* `server` is the standalone Express server
* `client` is the Angular web app
* `shared` is the code shared between the server and the client
* `electron` is the packaged desktop app (holding both the client and the server + some specific code)
* `design` is a non-code folder for various design docs

## To build the app

Install yarn - see https://yarnpkg.com

Then run:
```
for FOLD in shared client server; do cd $FOLD && yarn && yarn build && cd ..; done
```

## Database setup

The easiest is to edit `punchcontrol/server/src/dbconnection.ts` and set the `synchronize` and `dropSchema` flags to `true`.

## Run unpackaged during dev

Build the folders except the `electron` one as explained above, then setup a database and finally:
```
cd ../server
yarn run start
```

At last go to http://localhost:3000/races with your browser...


## Database support

In theory the app should work with SQLite and PostgreSQL, although SQLite is the main target and PostgreSQL is only a long term goal.

For now, there is no way to switch the DB at startup... you have to change the code (see `.../dbconnection.ts`).


### SQLite

This one is the easiest setup of course :) Nothing to do, the DB is stored under `/tmp/myevent.punch`. TypeOrm is able to generate DDL commands to create the model at startup.

### PostgreSQL

If you want to test with a PostgreSQL database...
```
sudo docker run -p 5432:5432 --rm --name postgres --env POSTGRES_PASSWORD='!Passw0rd' postgres:9.6
sudo docker exec -it postgres bash
psql --user postgres
create database punchcontrol;
```

Then modify `.../dbconnection.ts` as required to use PostgreSQL.

## Packaging with Electron

__NOTE__: this currently **no longer works** due to `link` dependencies that ElectronBuilder does not deal with.
See https://github.com/electron-userland/electron-builder/issues/2222

Once the other folders are built, finish with:
```
cd ./electron
yarn
yarn run dist
```

After a (long) Electron build, run:
```
./dist/punchcontrol-0.0.1-x86_64.AppImage
```
__NOTE__: if you chose `yes` it will install the app while `no` will just run it once.

Observe that nagigating with your browser to http://localhost:3000 shows the same UI!

If you connect to your DB and run the DB creation script (to be automated), you can then point your browser to http://localhost:3000/races to perform a DB request through the API.

## Cleanup

The cleanup is done by running this from the root project folder (be careful!)
```
rm -rf $(ls -d  */dist */node_modules)
```
