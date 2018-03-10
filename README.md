# punchcontrol

This project is an orienteering timing software licensed under GPL v3.

The goal is to run a web server (Node/Express) embedded in an Electron desktop app, serving an Angular web app on the local network, hence easily accessible remotely for concurrent management of the race.

**It is currently a work in progress, open sourced only for the sake of sharing the issues I encounter with 3rd party libs & tools.**

## Folders

* `server` is the standalone Express server
* `client` is the Angular 2+ web app
* `shared` is the code shared between the server and the client
* `electron` is the packaged desktop app (holding both the client and the server + some specific code)

## To build the app (regular nodejs)

Install `yarn` - see https://yarnpkg.com

Then run:
```
for FOLD in shared client server; do cd $FOLD && yarn && yarn build && cd ..; done
```

## Packaging with Electron

__NOTE__: this currently **no longer works** - working on it

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

## Develop

Use (or adapt if not running Gnome) the `run-dev.sh` script for live-reload / restart of both the server and client sides...


## Cleanup

The cleanup is done by running this from the root project folder (be careful!)
```
rm -rf $(ls -d  */dist */node_modules)
```
