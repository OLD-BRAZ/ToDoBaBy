const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 760,
    minWidth: 360,
    minHeight: 620,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:toggle-pin', () => {
  if (!mainWindow) return;
  const value = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(value);
  mainWindow.webContents.send('window:pinned', value);
});
ipcMain.on('window:close', () => mainWindow?.close());
