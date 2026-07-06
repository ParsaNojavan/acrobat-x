const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  pickPdf: () => ipcRenderer.invoke("pick-pdf"),
  readPdf: (filePath) => ipcRenderer.invoke("read-pdf", filePath),
  showMessageBox: (message) => ipcRenderer.invoke("show-message-box", message),

  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
});
