const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const isDev = require("electron-is-dev");
const path = require("path");
const fs = require("fs");
const io = require("socket.io-client");
const os = require('os');
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());

const UserAgent = require("user-agents");
const readerExcel = require("./readerExcel");


autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
var templateMenu = [
    {
        label: 'Start Robot',
        click() { 
            if(bankWindows) bankWindows.webContents.send("start");
        }
    },
    {
        label: 'Stop Robot',
        click() { 
            if(bankWindows) bankWindows.webContents.send("stop");
        }
    },
    {
        label: 'Reload',
        click() {
            if(bankWindows) bankWindows.webContents.send("reload");
        }
    }
]

let starting, listRekening, bankWindows, socket;
function sendStatusToWindow(text) {
    log.info(text);
    starting.webContents.send('message', text);
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function createStarting() {
    starting = new BrowserWindow({
        frame: false,
        minWidth: 100,
        minHeight: 100,
        height: 100,
        width: 100,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
    });
    // starting.webContents.openDevTools();
    starting.on('closed', () => starting = null);
    starting.loadURL(`file://${__dirname}/pages/starting.html#v${app.getVersion()}`);
    setTimeout(() => {
        if (isDev) {
            func.init();
        }else{
            autoUpdater.checkForUpdatesAndNotify();
        }
    }, 500);
}

function listRekeningWindows() {
    listRekening = new BrowserWindow({
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false
    });
    listRekening.on('closed', () => listRekening = null);
    listRekening.loadURL(`file://${__dirname}/pages/list-rekening.html`);
    // listRekening.webContents.openDevTools();
}

function createBankWindows() {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    bankWindows = new BrowserWindow({
        // autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, "preload/bri.js")
        },
        resizable: false
    });
    bankWindows.on('closed', () => {
        bankWindows = null;
        dataRekening.reset();
        listRekeningWindows();
    });
    bankWindows.webContents.session.on("will-download", (event, item, webContent) => {
        item.setSavePath(path.join(os.tmpdir(),item.getFilename()));
        item.on('updated', (event, state) => {
            if (state === 'interrupted') {
                console.log('Download is interrupted but can be resumed')
            }
        })
        item.once('done', (event, state) => {
            if (state === 'completed') {
                var data = readerExcel(item.getSavePath());
                var rek = dataRekening.active();
                socket.emit("updateData", {
                    type: "mutasi",
                    rek: rek,
                    data: data
                });
            } else {
              console.log(`Download failed: ${state}`)
            }
        })
    })
    bankWindows.webContents.session.clearCache();
    bankWindows.webContents.session.clearAuthCache();
    bankWindows.webContents.setUserAgent(userAgent.toString());
    bankWindows.loadURL('https://ib.bri.co.id/ib-bri/Login.html');
    bankWindows.webContents.openDevTools();
}

const func = {
    init: () => {
        starting.close();
        listRekeningWindows();
    },
    playMutasi: () => {
        listRekening.close();
        createBankWindows();
    }
}

const dataRekening = {
    has: () => {
        storage.has('list-rekening', function(error, hasKey) {
            if (error) throw error;
          
            if (!hasKey) {
                storage.set('list-rekening', [], function(error) {
                    if (error) throw error;
                });
            }
        });
    },
    get: () => {
        return storage.getSync('list-rekening');
    },
    put: (data) => {
        storage.set('list-rekening', data, function(error) {
            if (error) throw error;
        });
    },
    active: () => {
        var data = dataRekening.get();
        return data.find(e => e.status);
    },
    reset: () => {
        var data = dataRekening.get();
        data = data.map(e => {
            e.status = false;
            return e;
        });
        
        storage.set('list-rekening', data, function(error) {
            if (error) throw error;
        });

    },
    clear: () => {
        storage.clear(function(error) {
            if (error) throw error;
        });
    }
}

ipcMain.on("get-list-rekening", (event) => event.returnValue = dataRekening.get());
ipcMain.on("put-list-rekening", (event, data) => dataRekening.put(data));
ipcMain.on("active-list-rekening", (event) => event.returnValue = dataRekening.active());
ipcMain.on("play-mutasi", (event) => func.playMutasi());

ipcMain.on("update-saldo", (e, res) => {
    socket.emit("updateData", {
        type: "saldo",
        rek: res.rek,
        data: res.data,
        date: res.date
    });
})

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow("Check Vesion");
})

autoUpdater.on('update-available', (info) => {
    sendStatusToWindow("Update Available");
})

autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})

autoUpdater.on('download-progress', (progressObj) => {
    var percent = Math.ceil(progressObj.percent);
    var transferred = formatBytes(progressObj.transferred);
    var total = formatBytes(progressObj.total);
    var speed = formatBytes(progressObj.bytesPerSecond);
    
    sendStatusToWindow('Downloaded ' + percent + '%');
    starting.webContents.send("download", {
        total: ' (' + transferred + "/" + total + ')',
        network: speed
    })
})

autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
    autoUpdater.quitAndInstall();
});

autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
    func.init();
})

app.on('ready', function() {
    const menu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(menu);
    createStarting();
    // socket = io.connect("http://54.151.144.228:9992");
    socket = io.connect("http://localhost:9993");
    dataRekening.has();
});

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") app.quit();
});