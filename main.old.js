'use strict';
const { app, BrowserWindow, ipcMain, dialog, globalShortcut, shell } = require('electron');
const path = require('path');
const url = require('url');
const fetch = require('electron-main-fetch');
const storage = require('electron-json-storage');
const prompt = require('electron-prompt');

let mainWindow;
let dev = false; // Determine the mode (dev or production)
if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
    dev = true;
}// Temporary fix for broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
    app.commandLine.appendSwitch('high-dpi-support', 'true');
    app.commandLine.appendSwitch('force-device-scale-factor', '1');
}
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 400, // width of the window
        height: 700, // height of the window
        show: false, // don't show until window is ready
        frame: false,
        resizable: false,
        title: "Linkweb Softphone",
        icon: path.join(__dirname, 'src/assets/images/phone.png'),
        webPreferences: {
            nodeIntegration: true
        }
    });  // and load the index.html of the app.
    if(dev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('page-title-updated', function(e) {
        e.preventDefault();
    });
    let indexPath;
    if (dev && process.argv.indexOf('--noDevServer') === -1) {
        indexPath = url.format({
            protocol: 'http:',
            host: 'localhost:8080',
            pathname: 'index.html',
            slashes: true
        })
    } else {
        indexPath = url.format({
            protocol: 'file:',
            pathname: path.join(__dirname, 'dist', 'index.html'),
            slashes: true
        })
    }
    mainWindow.loadURL(indexPath);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (dev) {
            mainWindow.webContents.openDevTools();
        }
    });
    mainWindow.on('closed', function() {
        mainWindow = null
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('window.focus', (event, arg) => {
    if(mainWindow !== null) {
        mainWindow.show();
    }
    event.returnValue = 'received';
});

ipcMain.on('show.dialog', (event, arg) => {
    dialog.showMessageBox(arg);
    event.returnValue = 'received';
});

ipcMain.on('client.request', async (event, arg) => {
    let opt = {};
    if(arg.options.headers) {
        //opt.headers = arg.options.headers;
    }
    if(arg.options.body) {
        opt.body = arg.options.body;
    }
    if(arg.options.method) {
        opt.method = arg.options.method;
    }
    const response = await fetch(arg.url, opt).catch(e => {
        console.log(e, arg.url, opt);
    });
    let result = null;
    if(response) {
        result = await response.json();
    }
    event.returnValue = result;
});

ipcMain.on('main.resize', function (e, {x, y}) {
    if(mainWindow instanceof BrowserWindow) {
        mainWindow.setSize(x, y);
    }
    e.returnValue = 'received';
});

ipcMain.on('main.close', function (e) {
    if(mainWindow instanceof BrowserWindow) {
        mainWindow.close();
    }
    e.returnValue = 'received';
});

ipcMain.on('storage.set', function (e, {key, value}) {
    storage.set(key, value, function(error) {
        if (error) throw error;
    });
    e.returnValue = 'received';
});

ipcMain.on('storage.get', function (e, {key}) {
    storage.get(key, function(error, data) {
        if (error) {
            e.returnValue = null;
        }else {
            e.returnValue = data;
        }
    });
});

ipcMain.on('settings.init', function (e, {key}) {
    console.log(key);
    storage.get(key, function(error, data) {
        if (error) {
            e.returnValue = null;
        }else {
            e.returnValue = data;
        }
    });
});

ipcMain.on('open.url', function (e, {url}) {
    shell.openExternal(url).then(r => {
        e.returnValue = 'received';
    });
});

ipcMain.on('login.prompt', function (e) {
    prompt({
        title: 'Connexion à Linkweb CRM',
        label: 'Saisissez votre jeton de connexion : ',
        value: '',
        inputAttrs: {
            type: 'text'
        },
        type: 'input',
        icon: false
    }, mainWindow).then(r => {
        e.returnValue = r;
    });
});

const dataPath = storage.getDataPath();
console.log(dataPath);