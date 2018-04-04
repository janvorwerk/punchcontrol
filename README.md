# Punchcontrol

This project is an orienteering timing software licensed under GPL v3.

The goal is to run a web server (Node/Express) embedded in an Electron desktop app, serving an Angular web app, hence accessible remotely for concurrent management of the race. Data are stored in an SQLite database file.

# Status
This project is currently a __work in progress__! Don't even think of using it right now! :)


# Developers doc

All instructions below are beeing tested on Ubuntu Linux but the app should eventually run on Linux/OSX/Windows.

## Folders

* `server` is the standalone Express server
* `client` is the Angular web app
* `shared` is the code shared between the server and the client
* `electron` is the packaged desktop app (holding both the client and the server + some specific code)
* `design` is a non-code folder for various design docs

## To build the app

Install yarn - see https://yarnpkg.com

Then cd the project and run:
```
$ yarn
$ yarn run prepare
$ for FOLD in shared client server; do cd $FOLD && yarn && yarn build && cd ..; done
```

## Run unpackaged during dev

For a **live-reload**, just run the `./run-dev.sh` if you are using Gnome (or at least have `gnome-terminal`) then head towards http://localhost:4200

Build the folders except the `electron` one as explained above, then setup a database and finally:
```
cd ../server
yarn run start
```

At last go to http://localhost:3000/races with your browser...


## Database support

In theory the app should work with SQLite and PostgreSQL, although SQLite is the main target and PostgreSQL (or MySQL?) is only a long term goal.

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

## Database model & content

In `punchcontrol/server/src/dbconnection.ts` you will notice that both `synchronize` and `dropSchema` flags are set to `true` which means that the model and content of the DB is recreated at each startup.

## Packaging with Electron

Once the other folders are built, finish with:
```
cd ./electron
yarn
yarn run dist
```

After a (quite long) Electron build, run:
```
./dist/punchcontrol-0.0.1-x86_64.AppImage
```
__NOTE__: if you chose `yes` it will install the app while `no` will just run it once.

Observe that nagigating with your browser to http://localhost:3000 shows the same UI!

## Cleanup

The cleanup is done by running this from the root project folder (be careful!)
```
rm -rf $(ls -d  */dist */node_modules)
```
