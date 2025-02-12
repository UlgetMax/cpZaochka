const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development'; 

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:6969'); 
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist/index.html')); 
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
