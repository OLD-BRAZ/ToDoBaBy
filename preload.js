const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopWidget', {
  minimize: () => ipcRenderer.send('window:minimize'),
  togglePin: () => ipcRenderer.send('window:toggle-pin'),
  close: () => ipcRenderer.send('window:close'),
  onPinnedChange: (cb) => ipcRenderer.on('window:pinned', (_, value) => cb(value)),
});
