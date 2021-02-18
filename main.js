'use strict';
const { app, BrowserWindow, ipcMain, dialog, globalShortcut, shell } = require('electron');
const path = require('path');
const url = require('url');
const fetch = require('electron-main-fetch');
const storage = require('electron-json-storage');
const prompt = require('electron-prompt');
const {version} = require('./package.json');

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
        width: 1370, // width of the window
        height: 800, // height of the window
        minWidth: 1450,
        minHeight: 800,
        show: false, // don't show until window is ready
        frame: true,
        resizable: true,
        transparent: false,
        title: "Among Us - Mod Manager v" + version,
        icon: path.join(__dirname, 'src/assets/images/icon.png'),
        webPreferences: {
            nodeIntegration: true
        }
    });  // and load the index.html of the app.
    mainWindow.removeMenu();
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