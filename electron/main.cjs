// electron/main.cjs (全コード・PDF保存のみ)

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

// NODE_ENV を使って開発モードを判定
const isDev = process.env.NODE_ENV === "development";

process.env["DIST"] = path.join(__dirname, "../dist");
process.env["PUBLIC"] = app.isPackaged
    ? process.env["DIST"]
    : path.join(process.env["DIST"], "../public");

function createWindow() {
    const win = new BrowserWindow({
        icon: path.join(process.env["PUBLIC"], "icon.ico"),
        width: 1500,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            devTools: isDev,
            contextIsolation: true, // 必須
            nodeIntegration: false, // 必須
        },
    });

    // 開発中はデベロッパーツールを開く
    if (isDev) {
        win.webContents.openDevTools();
    }

    win.webContents.on("did-finish-load", () => {
        win.webContents.send(
            "main-process-message",
            new Date().toLocaleString()
        );
    });

    // isDev でURLを振り分け
    if (isDev) {
        win.loadURL("http://localhost:5173");
    } else {
        win.loadFile(path.join(process.env["DIST"], "index.html"));
    }
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// ビル一覧ウィンドウを開く
ipcMain.on("open-building-list", (event, month) => {
    const child = new BrowserWindow({
        parent: BrowserWindow.fromWebContents(event.sender),
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            devTools: isDev,
            contextIsolation: true, // 必須
            nodeIntegration: false, // 必須
        },
    });

    if (isDev) {
        child.webContents.openDevTools();
    }

    const url = isDev
        ? `http://localhost:5173/#building-list?month=${month}`
        : `file://${path.join(
              process.env["DIST"],
              "index.html"
          )}#building-list?month=${month}`;

    child.loadURL(url);
});

// --- 印刷 (★ 削除) ---
// (ipcMain.handle("handle-print", ...) のブロックを削除)

// --- PDFに保存 (変更なし) ---
ipcMain.handle("handle-save-pdf", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: "PDFとして保存",
        defaultPath: `stock-bird-graph-${Date.now()}.pdf`,
        filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    });
    if (canceled || !filePath) {
        return;
    }
    try {
        const pdfData = await win.webContents.printToPDF({
            printBackground: true,
            pageSize: "A4",
            landscape: true,
        });
        fs.writeFileSync(filePath, pdfData);
    } catch (error) {
        console.error("PDFの保存に失敗しました:", error);
        dialog.showErrorBox("PDF保存エラー", error.message);
    }
});