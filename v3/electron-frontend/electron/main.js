import { app, BrowserWindow } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path, { resolve } from 'node:path'
import { ipcMain } from "electron";
import * as fs from "node:fs";
import { exec } from 'child_process';
import http from 'http';
import { dialog } from 'electron';

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
let APP_PORT = null;

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win = BrowserWindow ?? null

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
    })
    // win.setMenu(null);
    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.handle("readFile", async (_event, args) => {
    console.log(args);
    const exeFolder = path.resolve('.');
    return fs.readFile(path.join("C:\\Users\\yiche\\screentime\\v3\\express-webserver\\", args), "utf8");
})

ipcMain.on("setAppPort", (_event, args) => {
    APP_PORT = args;
    console.log("APP_PORT", APP_PORT);
})

ipcMain.handle('check-trayapp-status', async (_event) => {
    let isRunning = false;
    isRunning = await new Promise((resolve) => {
        exec('tasklist', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing tasklist: ${error}`);
                resolve(false);
                return;
            }
            resolve(stdout.toLowerCase().includes('trayapp.exe'));
        });
    });
    return isRunning;
});

async function checkForUpdate() {
    const CURRENT_VERSION = "1.0.0";
    const VERSION_CHECK_URL = "http://localhost:3000/";
    // send a request to the server to check for updates
    try {
        const response = await fetch(VERSION_CHECK_URL).catch(e => console.log(e.message));
        const data = await response.json();
        console.log(data.latest);
        if (data.latest !== CURRENT_VERSION) {
            for (const downloadUrl of data.sources) {
                const response = await downloadUpdateFile(downloadUrl, data.latest);
                console.log(response);
                console.log("finished one iteration");
                showUpdateNotification(data.latest);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function downloadUpdateFile(downloadUrl, versionString) {
    const publicFilesFolder = path.join(process.env.PUBLIC, 'ScreenTime');
    const filePath = path.join(publicFilesFolder, versionString + ".exe");
    console.log(publicFilesFolder);
    console.log(filePath);
    if (fs.existsSync(filePath)) {
        console.log("File already exists");
        return Promise.resolve('File already exists');
    }

    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error(`Error fetching the file: ${response.status} ${response.statusText}`);
        }

        const file = fs.createWriteStream(filePath);
        const request = http.get(downloadUrl, (response) => {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log("File downloaded successfully");
                resolve("File downloaded successfully");
            });
        });

        return Promise.resolve('File downloaded successfully');
    } catch (error) {
        console.error('Download failed:', error);
        return Promise.reject('Download failed');
    }
}
function showUpdateNotification(versionString) {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: versionString,
        detail:
            'A new version has been downloaded. Restart the application to apply the updates.'
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        const TRAYAPP_PROCESS_NAME = "trayapp.exe";
        if (returnValue.response === 0) {
            console.log("restarting application");

            const publicFilesFolder = path.join(process.env.PUBLIC, 'ScreenTime');
            const filePath = path.join(publicFilesFolder, versionString + ".exe");
            console.log("starting file path ", filePath);

            if (APP_PORT) {
                fetch("http://localhost:" + APP_PORT + "/stop/");
            }
            exec(`taskkill /F /IM ${TRAYAPP_PROCESS_NAME}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error killing process: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Error output: ${stderr}`);
                    return;
                }
                console.log(`Process killed successfully: ${stdout}`);
            });

            exec(filePath + " /silent");
        }
    })
}

checkForUpdate();
app.whenReady().then(createWindow)
