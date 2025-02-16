const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getWasmPath: () => ipcRenderer.invoke("get-wasm-path"),
  getUsers: () => ipcRenderer.invoke("get-users"),
  checkDbStatus: () => ipcRenderer.invoke("check-db"),
});
