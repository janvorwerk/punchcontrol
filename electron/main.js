const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const crypto = require('crypto');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    const server = require('@punchcontrol/server');

    const LOGGING = server.initLogs();
    const LOGGER = LOGGING.getLogger(__filename);

    process.on('unhandledRejection', (reason, p) => {
        LOGGER.fatal(() => `Unhandled Rejection at:'${p}: ${reason}`);
    });

    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 1100, height: 700 });

    // Compute a random string which will be given to both web client
    // and server on startup to make sure that the client is really the page
    // embedded in the Electron App, which grants full admin priviledge.
    // @ts-ignore
    const electronSecret = crypto.randomBytes(32).toString('base64');
    const staticPath = path.join(__dirname, 'web');
    server.main(staticPath, electronSecret)
        .then(() => {
            LOGGER.info(`Server started`);
            // and load the web app
            mainWindow.loadURL('http://localhost:3000/electron', {
                extraHeaders:
                // TODO, when we support multiple users, this will need rework but it's OK for now
                'Authorization: Bearer ' + electronSecret
            });
        })
        .catch((err) => {
            LOGGER.error(() => `${err}`);
        });

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
})
