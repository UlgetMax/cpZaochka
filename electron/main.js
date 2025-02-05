const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development'; // Определяем режим разработки

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Если нужен preload
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:6969'); // Загрузка Vite-сервера
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist/index.html')); // Загрузка собранного приложения
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
