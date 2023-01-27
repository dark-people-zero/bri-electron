const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const isDev = require("electron-is-dev");
const path = require("path");
const os = require('os');
const util = require('util');
const childProcess = require('child_process');
const { fork } = require('child_process');
const exec = util.promisify(childProcess.exec);
const serverAuth = fork(`${__dirname}/pages/login/server.js`);
const TEN_MEGABYTES = 1000 * 1000 * 10;
const storage = require('electron-json-storage');
const GoogleSheet = require("./libraries/googleSheet");
const PW = require('./libraries/playwright');
const DB = require('./libraries/db');
const BK = require('./libraries/BK');
const pjson = require('./package.json');
const macaddress = require('macaddress');
let macDevice = null;
// storage.setDataPath(os.tmpdir());

const UserAgent = require("user-agents");
const readerExcel = require("./libraries/readerExcel");


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

let starting, listRekening, bankWindows, macAddress, winAuth, dataPW = {};
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
    starting.on('closed', () => {starting = null});
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
        width: 1000,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false
    });
    listRekening.on('closed', () => listRekening = null);
    listRekening.loadURL(`file://${__dirname}/pages/list-rekening.html`);
    listRekening.webContents.openDevTools();
}

function macAddressWindows() {
    macAddress = new BrowserWindow({
        width: 1000,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false
    });
    macAddress.on('closed', () => macAddress = null);
    macAddress.loadURL(`file://${__dirname}/pages/mac-addres.html`);
    macAddress.webContents.openDevTools();
}

function winAuthentication() {
    winAuth = new BrowserWindow({
        width: 500,
        height: 520,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            nativeWindowOpen: true,
            preload: path.join(__dirname, 'preload/authentication.js')
        },
        resizable: false,
    });
    winAuth.on('closed', () => winAuth = null);
    winAuth.loadURL("http://localhost:9990");

    winAuth.webContents.setWindowOpenHandler(() => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                autoHideMenuBar: true,
                alwaysOnTop: true
            }
        }
    });
    
    winAuth.webContents.session.clearCache();
    winAuth.webContents.session.clearStorageData();

    winAuth.webContents.openDevTools();
}

async function getAllProcess() {
    var query = `-Query "select * from Win32_Process where Name = 'firefox.exe' or Name = 'electron.exe' or Name = 'bri.exe' "`;
    let { error, stdout, stderr } = await exec(`Get-WmiObject ${query}`, { shell: 'powershell', maxBuffer: TEN_MEGABYTES });
    if (stdout === '') return [];
    stdout = stdout.trim().split(os.EOL).reduce((acc, cur) => {
        if (cur.match(/^$/)) {
            acc.unshift({});
        } else {
            acc[0][cur.split(':')[0]?.trim().toLocaleLowerCase()] = cur.split(':')[1]?.trim();
        }
        return acc;
    }, [{}]).map(e => {
        let pid = Number.parseInt(e.processid, 10);
        let name = e.name;
        return {
            pid,
            name
        }
    })
    return stdout;
}

const func = {
    init: () => {
        starting.close();
        var sesiAccount = sessionAccount.get();
        if (sesiAccount.token) {
            listRekeningWindows();
        }else{
            winAuthentication();
        }
    },
    sendMessage: (data, message, error, runInterval = false) => {
        listRekening.webContents.send("change-status", {
            username: data.username,
            error: error,
            message: message,
            runInterval
        });
    },
    playMutasi: async (data, cb = 0) => {
        const opt = {
            dev: isDev,
            exeDir: app.getPath("exe").replace(pjson.name+".exe","")
        }
        const pw = new PW(data, opt);
        dataPW[data.username] = pw;
        const br = await pw.createBrowser();
        var msg = "Sedang membuat browser. percobaan ke "+(cb+1);
        func.sendMessage(data, msg, false);
        if (br.status) {
            func.sendMessage(data, "Mencoba Login sabar ya gan...", false);
            const lg = await pw.login();
            if (lg.status) {
                func.sendMessage(data, "Login berhasil dengan user, "+lg.message, false);
                setTimeout(async () => {
                    func.sendMessage(data, "Lagi coba ambil saldo, "+lg.message, false);
                    await func.getSaldo(data);
                    setTimeout(async () => {
                        if (!pw.error) {
                            func.sendMessage(data, "Lagi coba ambil mutasi, "+lg.message, false);
                            await func.getMutasi(data);
                        }
                    }, 1000);
                }, 1000);
            }else{
                if (lg.rejected) {
                    delete dataPW[data.username];
                    if (cb > 5) {
                        msg = "Silahkan ganti Proxy atau ganti type browser. Jika masih berlanjut silahkan coba 30 menit lagi untuk proxy ini.";
                        func.sendMessage(data, msg, true);
                    }else{
                        func.sendMessage(data, msg, false);
                        await func.playMutasi(cb+1);
                    }
    
                }else{
                    if (pw.close) {
                        func.sendMessage(data, lg.message, true);
                        delete dataPW[data.username];
                    }else{
                        func.sendMessage(data, "Lagi coba logout ", false);
                        const logout = await pw.logout();
                        if (logout.status) {
                            func.sendMessage(data, lg.message, true);
                        }else{
                            func.sendMessage(data, logout.message, true);
                        }
                        delete dataPW[data.username];
                    }
                }
            }
        }else{
            if (br.rejected) {
                delete dataPW[data.username];
                if (cb > 5) {
                    msg = "Silahkan ganti Proxy atau ganti type browser. Jika masih berlanjut silahkan coba 30 menit lagi untuk proxy ini.";
                    func.sendMessage(data, msg, true);
                }else{
                    func.sendMessage(data, msg, false);
                    await func.playMutasi(data, cb+1);
                }

            }else{
                func.sendMessage(data, br.message, true);
                delete dataPW[data.username];
            }
        }
    },
    stopMutasi: async (data) => {
        var tr = dataPW[data.username];
        if (tr) {
            tr.closeWindows();
            delete dataPW[data.username];
        }
    },
    getSaldo: async(data) => {
        const pw = dataPW[data.username];
        const sl = await pw.saldo();
        if (sl.status) {
            func.sendMessage(data, "Sedang upload data saldo ke DB", false);
            var usr = sessionAccount.get();
            const saveSaldo = await DB.saveData({
                data: {
                    saldo: sl.data.saldo
                },
                norek: data.norek,
                username: data.username,
                email: usr.email,
                time: sl.data.time
            }, "saldo");
            if (saveSaldo.status) {
                func.sendMessage(data, "Berhasil upload data saldo ke DB", false);
            }else{
                func.sendMessage(data, "mencoba logout", false);
                var lg = await pw.logout();
                if (lg.status) {
                    func.sendMessage(data, saveSaldo.message, true);
                } else {
                    func.sendMessage(data, lg.message, true);
                }
            }

        }else{
            var msg = "ada error pada get saldo. ini error nya => "+sl.message;
            func.sendMessage(data, msg, true);
            setTimeout(async () => {
                func.sendMessage(data, "Lagi coba logout", true);
                const lg = await pw.logout();
                if (lg.status) {
                    func.sendMessage(data, msg, true);
                }else{
                    func.sendMessage(data, lg.message, true);
                }
                delete dataPW[data.username];
            }, 1000);
        }
    },
    getMutasi: async(data) => {
        func.sendMessage(data, "Sedang ambil data mutasi", false);
        const pw = dataPW[data.username];
        const mt = await pw.mutasi();
        if (mt.status) {
            func.sendMessage(data, "Sedang upload data mutasi ke DB", false);
            var usr = sessionAccount.get();
            var dt = mt.data.data.mutasi.map(e => {
                e.type = e.debet != "" || e.debet > 0 ? "DB" : "CR";
                e.amount = e.debet != "" || e.debet > 0 ? e.debet : e.kredit;
                delete e.debet;
                delete e.kredit;
                return e;
            });
            const saveMutasi = await DB.saveData({
                data: {
                    mutasi: dt
                },
                norek: data.norek,
                username: data.username,
                email: usr.email,
                time: mt.data.time
            }, "mutasi");

            if (saveMutasi.status) {
                func.sendMessage(data, "Berhasil upload data mutasi ke DB", false, true);
            }else{
                func.sendMessage(data, "mencoba logout", false);
                var lg = await pw.logout();
                if (lg.status) {
                    func.sendMessage(data, saveMutasi.message, true);
                } else {
                    func.sendMessage(data, lg.message, true);
                }
            }

        }else{
            var msg = "ada error pada get mutasi. ini error nya => "+mt.message;
            func.sendMessage(data, msg, false);
            setTimeout(async () => {
                func.sendMessage(data, "Lagi coba logout", false);
                const lg = await pw.logout();
                if (lg.status) {
                    func.sendMessage(data, msg, true);
                }else{
                    func.sendMessage(data, lg.message, true);
                }
                delete dataPW[data.username];
            }, 1000);
        }
    },
    logoutBank: async (username) => {
        const pw = dataPW[username];
        const data = {username};
        func.sendMessage(data, "Lagi coba logout", false);
        const lg = await pw.logout();
        if (lg.status) {
            func.sendMessage(data, "Berhasil logout", true);
        }else{
            func.sendMessage(data, lg.message, true);
        }
        delete dataPW[data.username];
    },
    getSaldoMutasi: async (data) => {
        const pw = dataPW[data.username];
        await func.getSaldo(data);
        if (!pw.error) await func.getMutasi(data);
    },
    checAccount: async (data, token) => {
        try {
            var account = await BK.account(token);
            if (account.status) {
                var site = account.data.site_data.map(e => e.site_code);
                if (site.includes(data.situs)) {
                    const ma = await DB.getMacaddres({
                        username: data.email,
                        situs: data.situs,
                        macaddres: macDevice
                    });
                    if (ma.status) {
                        var dtma = ma.data.find(e => e.macaddres == macDevice);
                        if (dtma) {
                            const pr = await DB.privilage(data.email);
                            if (pr.status) {
                                data.admin = pr.data ? true : false;
                                sessionAccount.put(data);
                                return {
                                    status: true,
                                    data: data
                                }
                            }else{
                                return {
                                    status: false,
                                    message: pr.message
                                }
                            }
                        }else{
                            var msg = "You are not allowed because your device has not been registered, please contact SMB Spv to add a device ID ("+macDevice+") for your account.";
                            return {
                                status: false,
                                message: msg
                            }
                        }
                    }else{
                        return {
                            status: false,
                            message: ma.message
                        }
                    }
                }else{
                    var msg = "You are not allowed to enter the "+data.situs+" site, please contact SMB Spv to be added to the "+data.situs+" site.";
                    return {
                        status: false,
                        message: msg
                    }
                }
            }else{
                var msg = account.errors.map(e => {
                    if(typeof e == 'object') e = e.join(", ");
                    return e;
                }).join(", ");
                return {
                    status: false,
                    message: msg
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

const dataRekening = {
    has: () => {
        storage.has('list-rekening-bri', function(error, hasKey) {
            if (error) throw error;
          
            if (!hasKey) {
                storage.set('list-rekening-bri', [], function(error) {
                    if (error) throw error;
                });
            }
        });
    },
    get: () => {
        return storage.getSync('list-rekening-bri');
    },
    put: (data) => {
        storage.set('list-rekening-bri', data, function(error) {
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
        
        storage.set('list-rekening-bri', data, function(error) {
            if (error) throw error;
        });

    },
    clear: () => {
        storage.clear(function(error) {
            if (error) throw error;
        });
    }
}

const configGoogleSheet = {
    has: () => {
        storage.has('config-google-sheet-bri', function(error, hasKey) {
            if (error) throw error;
          
            if (!hasKey) {
                storage.set('config-google-sheet-bri', {}, function(error) {
                    if (error) throw error;
                });
            }
        });
    },
    get: () => {
        return storage.getSync('config-google-sheet-bri');
    },
    put: (data) => {
        storage.set('config-google-sheet-bri', data, function(error) {
            if (error) throw error;
        });
    },
}

const sessionAccount = {
    has: () => {
        storage.has('sessionAccount-bri', function(error, hasKey) {
            if (error) throw error;
          
            if (!hasKey) {
                storage.set('sessionAccount-bri', {}, function(error) {
                    if (error) throw error;
                });
            }
        });
    },
    get: () => {
        return storage.getSync('sessionAccount-bri');
    },
    put: (data) => {
        storage.set('sessionAccount-bri', data, function(error) {
            if (error) throw error;
        });
    },
}

ipcMain.on("close", async event => {
    for (const item of Object.keys(dataPW)) {
        dataPW[item].closeWindows();
    }
    const allPros = await getAllProcess();
    allPros.forEach(e => {
        process.kill(e.pid, 'SIGINT');
    });
    app.quit();
})
ipcMain.on("minimize", event => BrowserWindow.getFocusedWindow().minimize() )
ipcMain.on("fullscreen", event => BrowserWindow.getFocusedWindow().isMaximized() ? BrowserWindow.getFocusedWindow().restore() : BrowserWindow.getFocusedWindow().maximize() )

ipcMain.on("get-list-rekening", (event) => event.returnValue = dataRekening.get());
ipcMain.on("put-list-rekening", (event, data) => dataRekening.put(data));
ipcMain.on("active-list-rekening", (event) => event.returnValue = dataRekening.active());
ipcMain.on("play-mutasi", (event, data) => func.playMutasi(data));
ipcMain.on("stop-mutasi", (event, data) => func.stopMutasi(data));

ipcMain.on("get-config-google-sheet", (event) => event.returnValue = configGoogleSheet.get());
ipcMain.on("put-config-google-sheet", (event, data) => configGoogleSheet.put(data));

ipcMain.on("get-situs", async (event) => {
    var situs = await BK.situs()
    event.reply("get-situs",situs)
})

ipcMain.on("sessionAccount", (event) => event.returnValue = sessionAccount.get());
ipcMain.on("getRekening", async (event) => {
    var usr = sessionAccount.get();
    var rk = await BK.rekening(usr);
    if (rk.status) {
        var dt = rk.data.data.map(e => {
            return {
                username: e.account_username,
                password: e.account_password,
                norek: e.rekening_data[0].rekening_number,
                interval: 15,
                status: false,
                showBrowser: false,
                typeBrowser: 'chromium',
            }
        });
        event.reply("getRekening", {
            status: true,
            data: dt
        })
    }else{
        event.reply("getRekening", {
            status: false,
            message: "Ada error dari BK, silahkan menghubungi Spv SMB."
        })
    }
})

ipcMain.on("checkAccount", async (event) => {
    const usr = sessionAccount.get();
    const ck = await func.checAccount(usr, usr.token);
    if (ck.status) {
        event.reply("checkAccount", {
            status: true,
            data: ck.data
        });
    }else{
        event.reply("checkAccount", {
            status: false,
            message: ck.message
        });
    }
})

ipcMain.on("showRekening", (event) => {
    listRekeningWindows();
    macAddress.close();
})

ipcMain.on("showMacAddress", (event) => {
    macAddressWindows();
    listRekening.close();
})

ipcMain.on("login", async (event, data) => {
    const login = await BK.login(data);
    if (login.status) {
        sessionAccount.put({
            token: login.data.authorization,
            email: data.username,
            situs: data.situs,
        });
        listRekeningWindows();
        winAuth.close();
    }else{
        var msg = login.errors.map(e => {
            if(typeof e == 'object') e = e.join(", ");
            return e;
        }).join(", ");
        event.reply("error-login", msg);
    }
})

ipcMain.on("logout", (e) => {
    sessionAccount.put({});
    winAuthentication();
    listRekening.close();
})

ipcMain.on("logoutBank", (e, username) => func.logoutBank(username));
ipcMain.on("getSaldoMutasi", (e, data) => func.getSaldoMutasi(data));

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

app.on('ready', async function() {
    macDevice = await macaddress.one();
    const menu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(menu);
    createStarting();
    dataRekening.has();
    configGoogleSheet.has();
    sessionAccount.has();
});

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") {
        app.quit();
        serverAuth.kill('SIGINT');
    }
});