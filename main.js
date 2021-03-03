'use strict';
const {app, BrowserWindow, ipcMain, dialog, globalShortcut, shell} = require('electron');
const path = require('path');
const url = require('url');
const fetch = require('electron-main-fetch');
const storage = require('electron-json-storage');
const prompt = require('electron-prompt');
const {version} = require('./package.json');
const DownloadManager = require("electron-download-manager");
const fs = require('fs');
const unzipper = require("unzipper");
const {exec, execFile} = require('child_process');

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
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });  // and load the index.html of the app.
    mainWindow.removeMenu();
    if (dev) {
        mainWindow.webContents.openDevTools();
    } else {
        //mainWindow.webContents.openDevTools();
    }

    mainWindow.on('page-title-updated', function (e) {
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
        } else {
            //mainWindow.webContents.openDevTools();
        }
    });
    mainWindow.on('closed', function () {
        mainWindow = null
    });
}

ipcMain.on('storage.set', function (e, {key, value}) {
    storage.set(key, value, function (error) {
        if (error) throw error;
    });
    e.returnValue = 'received';
});

ipcMain.on('storage.get', function (e, {key}) {
    storage.get(key, function (error, data) {
        if (error || (Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
            e.returnValue = null;
        } else {
            e.returnValue = data;
        }
    });
});

function getAmongUsInstallationFolderPath() {
    return new Promise(resolve => {
        storage.get('config', function (error, data) {
            resolve(data.amongUsFolder.replace('Among Us.exe', ''));
        });
    });
}

const dataPath = storage.getDataPath();
const downloadModsFolder = dataPath + '/mods-archives';
const modsFolder = dataPath + '/mods'

ipcMain.handle('download.zip', (e, {mod}) => {
    return new Promise(resolve => {
        DownloadManager.download({
            url: mod.zip,
            onProgress: (progress) => {
                //console.log(progress);
                e.sender.send('download.zip.progress', progress);
            }
        }, function (error, info) {
            if (error) {
                resolve(false);
            } else {
                fs.createReadStream(info.filePath)
                    .pipe(unzipper.Extract({path: modsFolder + '/' + mod.id.toString()}))
                    .on('entry', entry => entry.autodrain())
                    .promise().then(() => {
                        fs.promises.unlink(info.filePath).then(() => {
                            resolve(true);
                        });
                });
            }
        });
    });
});

ipcMain.handle('get.installed.mods', async (e) => {
    if(!fs.existsSync(modsFolder)) {
        return [];
    } else {
        const folders = await fs.promises.readdir(modsFolder);
        return folders.map(folder => Number.parseInt(folder));
    }
});

function execCmd(command) {
    return new Promise(resolve => {
        exec(command, (error, data, getter) => {
            if(error){
                console.log("error",error.message);
                return;
            }
            if(getter){
                console.log("data",data);
                return;
            }
            console.log("data",data);
            resolve(true);
        });
    });
}

async function restoreVanillaAmongUs() {
    const amongUsFolder = await getAmongUsInstallationFolderPath();
    const VANILLA_FILES = ['Among Us_Data', 'Among Us.exe', 'GameAssembly.dll', 'UnityCrashHandler32.exe', 'UnityPlayer.dll'];
    const files = await fs.promises.readdir(amongUsFolder);
    for (const file of files) {
        if(!VANILLA_FILES.includes(file)) {
            const filePath = amongUsFolder + file;
            if((await fs.promises.lstat(filePath)).isDirectory()) {
                await execCmd(`rmdir "${filePath}"`);
            } else {
                await fs.promises.unlink(filePath);
                //await execCmd(`rmdir "${filePath}"`);
            }
        }
    }
    return true;
}

ipcMain.handle('play.mod', async (e, {mod}) => {
    await restoreVanillaAmongUs();
    const folder = modsFolder + '/' + mod.id.toString();
    const files = await fs.promises.readdir(folder);
    const amongUsFolder = await getAmongUsInstallationFolderPath();
    for (const fileName of files) {
        const filePath = `${folder}/${fileName}`;
        if((await fs.promises.lstat(filePath)).isFile()) {
            await execCmd(`mklink "${amongUsFolder}${fileName}" "${folder}/${fileName}"`);
        } else {
            await execCmd(`mklink /D "${amongUsFolder}${fileName}" "${folder}/${fileName}"`);
        }
    }
    execFile(amongUsFolder + 'Among Us.exe');
    return true;
});

ipcMain.handle('play.vanilla', async (e) => {
    await restoreVanillaAmongUs();
    const amongUsFolder = await getAmongUsInstallationFolderPath();
    execFile(amongUsFolder + 'Among Us.exe');
    return true;
});

ipcMain.handle('open.link', async (e, {link}) => {
    await shell.openExternal(link);
    return true;
});

DownloadManager.register({
    downloadFolder: downloadModsFolder
});
console.log(dataPath);

app.on('ready', createWindow);
