const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  
  getWasmPath: () => ipcRenderer.invoke("get-wasm-path"),
  getUsers: () => ipcRenderer.invoke("get-users"),
  checkDbStatus: () => ipcRenderer.invoke("check-db"),
  getGroups: () => ipcRenderer.invoke("get-groups"),
  getStudentsByGroup: (groupId) => ipcRenderer.invoke("get-students-by-group", groupId),
  
  getSpecialties: () => ipcRenderer.invoke("get-specialties"),
  addSpecialty: (name) => ipcRenderer.invoke("add-specialty", name), 
  updateSpecialty: (id, name) => ipcRenderer.invoke("update-specialty", id, name), 
  deleteSpecialty: (id) => ipcRenderer.invoke("delete-specialty", id),

  addStudents: (students) => ipcRenderer.invoke("add-students", students),
  getStudentsByGroupAndSpecialty: (groupId, specialtyId) => 
    ipcRenderer.invoke("get-students-by-group-and-specialty", groupId, specialtyId),
  deleteStudents: (students) => ipcRenderer.invoke('delete-students', students),
  updateStudents: (students) => ipcRenderer.invoke('update-students', students),
});
