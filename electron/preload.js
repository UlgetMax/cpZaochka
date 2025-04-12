const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getProcesses: () => ipcRenderer.invoke("get-processes"),
  insertTextToWord: (text) => ipcRenderer.invoke("insert-text-word", text),
  insertTextToExcel: (text) => ipcRenderer.invoke("insert-text-excel", text),
  insertTextSmart: (text, process) => ipcRenderer.invoke("insert-text-smart", text, process),
  getActiveProcess: () => ipcRenderer.invoke("get-active-process")
});
