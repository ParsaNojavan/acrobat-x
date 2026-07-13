import fs from "fs/promises";
import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  session,
} from "electron";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.setName("PDF Editor");

const APP_KEY = "pdf-editor-secret-key-123456";
const NEXT_URL = "http://localhost:3000";

let win = null;
let headerListenerRegistered = false;

function registerAppKeyHeader() {
  if (headerListenerRegistered) {
    return;
  }

  const filter = {
    urls: [
      "http://localhost:3000/*",
      "http://127.0.0.1:3000/*",
    ],
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(
    filter,
    (details, callback) => {
      const requestHeaders = Object.assign({}, details.requestHeaders, {
        "X-App-Key": APP_KEY,
      });

      callback({
        cancel: false,
        requestHeaders: requestHeaders,
      });
    }
  );

  headerListenerRegistered = true;
  console.log("App Key header listener registered successfully.");
}

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");

  win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#18181B",
      symbolColor: "#ffffff",
      height: 35,
    },
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  });

  win.once("ready-to-show", () => {
    win?.show();
  });

  win.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error("Failed to load Next.js application:", {
        errorCode,
        errorDescription,
        validatedURL,
      });

      win?.show();
    }
  );

  win.webContents.on("did-finish-load", () => {
    console.log("Next.js app loaded inside Electron window.");
  });

  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }

  win.loadURL(NEXT_URL).catch((error) => {
    console.error("win.loadURL failed on initialization:", error);
    win?.show();
  });

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

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function registerIpcHandlers() {
  ipcMain.handle("pick-pdf", async () => {
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      properties: ["openFile"],
      filters: [
        {
          name: "PDF Files",
          extensions: ["pdf"],
        },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return {
      path: result.filePaths[0],
    };
  });

  ipcMain.handle("read-pdf", async (_event, filePath) => {
    try {
      if (typeof filePath !== "string" || !filePath) {
        throw new Error("Invalid file path parameter.");
      }

      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch (error) {
      console.error("Failed to read PDF file via FS:", error);
      throw error;
    }
  });

  ipcMain.on("window:minimize", () => {
    win?.minimize();
  });

  ipcMain.on("window:maximize", () => {
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on("window:close", () => {
    win?.close();
  });
}

app.whenReady().then(() => {

  registerAppKeyHeader();

  createMenu();
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
