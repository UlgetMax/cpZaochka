const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getWasmPath: () => ipcRenderer.invoke("get-wasm-path"),
  getUsers: () => ipcRenderer.invoke("get-users"),
  checkDbStatus: () => ipcRenderer.invoke("check-db"),
  getGroups: () => ipcRenderer.invoke("get-groups"),
  getStudentsByGroup: (groupId) => ipcRenderer.invoke("get-students-by-group", groupId),
  getSpecialties: () => ipcRenderer.invoke("get-specialties"),
  addStudents: (students) => ipcRenderer.invoke("add-students", students),

});
