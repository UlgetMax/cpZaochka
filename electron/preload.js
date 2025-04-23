const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getProcesses: () => ipcRenderer.invoke("get-processes"),
  
  getActiveProcess: () => ipcRenderer.invoke("get-active-process"),
  setLastActiveProcess: (name) => ipcRenderer.invoke("set-last-process", name),
  insertTextSmart: (text) => ipcRenderer.invoke("insert-smart", text),

  replacePlaceholdersInWord: (obj) => ipcRenderer.invoke("replacePlaceholdersInWord", obj),

});
