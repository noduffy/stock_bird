const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openBuildingList: (month) => ipcRenderer.send('open-building-list', month),
});

window.addEventListener('DOMContentLoaded', () => {
    // preload script
});