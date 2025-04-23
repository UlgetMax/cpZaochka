const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require("path");

const wordAddon = require("../build/Release/wordAutomation");

const isDev = process.env.NODE_ENV === 'development';
console.log("");
console.log("");
console.log("");

console.log("Electron arch:", process.arch);
console.log("");
console.log("");
console.log("");
const createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 750,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:6969");
  } else {
    win.loadFile(path.join(app.getAppPath(), "dist/index.html"));
  }
  win.webContents.openDevTools();


};


ipcMain.handle("get-processes", () => {
  return wordAddon.getProcesses(); 
});

ipcMain.handle("get-active-process", () => {
  return wordAddon.getActiveProcessName();
});

ipcMain.handle("set-last-process", (event, processName) => {
  return wordAddon.setLastActiveProcess(processName);
});

ipcMain.handle("insert-smart", (event, text) => {
  return wordAddon.insertTextSmart(text); 
});

ipcMain.handle("insert-multi-word", (event, textArray) => {
  return wordAddon.insertTextMultiWord(textArray);
});

ipcMain.handle("replacePlaceholdersInWord", (event, placeholders) => {
  return wordAddon.replacePlaceholdersInWord(placeholders);
});





ipcMain.handle("get-wasm-path", () => {
  return path.join(process.resourcesPath, "test.wasm");
});




app.whenReady().then(async () => {
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
