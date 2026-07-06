import fs from "fs/promises";
import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.setName("PDF Editor");

let win = null;

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");

  win = new BrowserWindow({
    width: 1400,
    height: 900,
    titleBarStyle: "hidden",
    titleBarOverlay: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.openDevTools();
  win.loadURL("http://localhost:3000");

  win.on("closed", () => {
    win = null;
  });
}

function createMenu() {
  const template = [
    ...(process.platform === "darwin"
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    { role: "fileMenu" },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createMenu();

  ipcMain.handle("pick-pdf", async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ["openFile"],
      filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    return { path: result.filePaths[0] };
  });

  ipcMain.handle("read-pdf", async (_event, filePath) => {
    try {
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch (error) {
      console.error("Failed to read file:", error);
      throw error;
    }
  });

  ipcMain.on("window:minimize", () => win?.minimize());
  ipcMain.on("window:maximize", () => {
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });
  ipcMain.on("window:close", () => win?.close());

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
