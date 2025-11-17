// electron/preload.js (全コード)

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    openBuildingList: (month) =>
        ipcRenderer.send("open-building-list", month),

    // handlePrint の行を削除
    handleSavePDF: () => ipcRenderer.invoke("handle-save-pdf"),
});