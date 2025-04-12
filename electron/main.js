const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const { exec } = require("child_process");
// const edge = require('edge-js');
const path = require("path");
const fs = require("fs");

const wordAddon = require("../build/Release/wordAutomation");

// const dllPath = path.join(__dirname, 'InsertText.dll');

const isDev = process.env.NODE_ENV === 'development';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
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


function getForegroundProcessName() {
  const hwnd = require("node-window-manager").getActiveWindow();
  if (!hwnd) return null;
  const proc = hwnd.process;
  return proc ? path.basename(proc.path) : null;
}

ipcMain.handle("get-active-process", async () => {
  try {
    const name = getForegroundProcessName();
    return name || null;
  } catch (e) {
    return null;
  }
});

ipcMain.handle("insert-text-smart", async (event, text, processName) => {
  try {
    return wordAddon.insertTextSmart(text, processName);
  } catch (err) {
    return { success: false, error: err.message };
  }
});


ipcMain.handle("insert-text-excel", async (event, text) => {
  try {
    console.log('Trying to insert text:', text);
    const start = Date.now();
    wordAddon.insertTextToExcel(text);
    console.log(`Success in ${Date.now() - start}ms`);
    return { success: true };
  } catch (err) {
    console.error('Native module error:', err);
    return { 
      success: false, 
      error: err.message,
      stack: err.stack 
    };
  }
});





ipcMain.handle("insert-text-word", async (event, text) => {
  try {
    console.log('Trying to insert text:', text);
    const start = Date.now();
    wordAddon.insertTextToWord(text);
    console.log(`Success in ${Date.now() - start}ms`);
    return { success: true };
  } catch (err) {
    console.error('Native module error:', err);
    return { 
      success: false, 
      error: err.message,
      stack: err.stack 
    };
  }
});



ipcMain.handle("insert-docx-word", async () => {
  try {
    const filePath = path.join(__dirname, "vedomost.docx");

    if (!fs.existsSync(filePath)) {
      return "Файл ведомости не найден!";
    }

    // Запускаем PowerShell-скрипт
    const psScript = path.join(__dirname, "insert_docx.ps1");
    exec(`powershell -ExecutionPolicy Bypass -File "${psScript}" "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Ошибка: ${stderr}`);
        return;
      }
      // console.log(`Вывод: ${stdout}`);
    });

    return "Ведомость вставлена в Word!";
  } catch (error) {
    return `Ошибка: ${error.message}`;
  }
});


ipcMain.handle("insert-list-word", async (event, students) => {
  try {
    const scriptPath = path.join(__dirname, "insertListWord.ps1");
    const command = `powershell -ExecutionPolicy Bypass -NoProfile -File "${scriptPath}" -students '${JSON.stringify(students)}'`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка выполнения: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Ошибка PowerShell: ${stderr}`);
        return;
      }
      console.log(`PowerShell вывел: ${stdout}`);
    });
  } catch (err) {
    console.error("Ошибка при вызове insert-list-word:", err);
  }
});

ipcMain.handle("insert-list-excel", async (event, students) => {
  try {
    const scriptPath = path.join(__dirname, "insertListExcel.ps1");
    const command = `powershell -ExecutionPolicy Bypass -NoProfile -File "${scriptPath}" -students '${JSON.stringify(students)}'`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка выполнения: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Ошибка PowerShell: ${stderr}`);
        return;
      }
      console.log(`PowerShell вывел: ${stdout}`);
    });
  } catch (err) {
    console.error("Ошибка при вызове insert-list-excel:", err);
  }
});



ipcMain.handle("get-wasm-path", () => {
  return path.join(process.resourcesPath, "test.wasm");
});


ipcMain.handle("get-processes", () => {
  return wordAddon.getProcesses(); 
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
