const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('path');
const {Client} = require ("pg");

const isDev = process.env.NODE_ENV === 'development';

const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "123456",
  database: "zaochka",
  port: 5555,
});

client.connect().catch(err => console.error("Ошибка подключения к БД:", err));

async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    // fullscreen: true,
    // width: 1600,
    // height: 800,
    width,
    height,
    // kiosk: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.maximize();

  if (isDev) {
    win.loadURL('http://localhost:6969');
  } else {
    win.loadURL(`file://${path.join(__dirname, "../dist/index.html")}`);
  }

  win.webContents.openDevTools();
}

ipcMain.handle("get-users", async () => {
  try {
    const res = await client.query("SELECT * FROM users");
    return res.rows;
  } catch (err) {
    console.error("Ошибка выполнения запроса:", err);
    return [];
  }
});

ipcMain.handle("check-db", async () => {
  try {
    await client.query("SELECT 1"); 
    return "Подключение к БД успешно!";
  } catch (err) {
    console.error("Ошибка подключения к БД:", err);
    return `Ошибка: ${err.message}`;
  }
});


ipcMain.handle("get-wasm-path", () => {
  return path.join(process.resourcesPath, "test.wasm");
});


app.whenReady().then(() => {

  const menuTemplate = [
    {
      label: "Файл",
      submenu: [
        { label: "Открыть", click: () => console.log("Открыть файл") },
        { type: "separator" },
        { label: "Выход", role: "quit" },
      ],
    },
  ];
  
  const menu = Menu.buildFromTemplate(menuTemplate);

  Menu.setApplicationMenu(menu);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
