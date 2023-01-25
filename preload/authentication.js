const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("ipc", {
    send: (channel, arg = []) => ipcRenderer.send(channel, arg),
    on: (channel, func) => ipcRenderer.on(channel, func)
});

