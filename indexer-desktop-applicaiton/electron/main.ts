import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain } from "electron";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import { join } from "path";
import { initializeIpcStore } from "./ipc";

const createWindow = () => {
  // Create the splash screen
  const splashWindow = new BrowserWindow({
    width: 700,
    height: 450,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    icon: is.dev
      ? join(__dirname, "..", "public", "favicon.ico")
      : join(app.getAppPath(), "app", "public", "favicon.ico"),
  });

  const splashPath = is.dev
  ? join(__dirname, "..", "public", "splash", "splash.html")
  : join(app.getAppPath(), "app", "public", "splash", "splash.html");

  splashWindow.loadFile(splashPath);
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    show: false,
    icon: is.dev ? join(__dirname, "..", "public", "favicon.ico") : join(app.getAppPath(), "app", "public", "favicon.ico"),
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  // mainWindow.on("ready-to-show", () => mainWindow.show());

  // Remove this after dev and uncomment the above
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();

    if (is.dev) {
      mainWindow.webContents.openDevTools({ mode: "detach" }); // opens Chrome DevTools
    }
  });

  // Remove menu bar
  mainWindow.removeMenu();

  const loadURL = async () => {
    if (is.dev) {
      mainWindow.loadURL("http://localhost:3000");
    } else {
      try {
        const port = await startNextJSServer();
        console.log("Next.js server started on port:", port);
        mainWindow.loadURL(`http://localhost:${port}`);
      } catch (error) {
        console.error("Error starting Next.js server:", error);
      }
    }
  };

  loadURL();

  // Wait until the main window is ready to show
  mainWindow.webContents.on("did-finish-load", () => {
    // Close the splash screen after the main window is ready
    splashWindow.close();
  });
  return mainWindow;
};

const startNextJSServer = async () => {
  try {
    const nextJSPort = await getPort({ portRange: [30_011, 50_000] });
    const webDir = join(app.getAppPath(), "app");

    await startServer({
      dir: webDir,
      isDev: false,
      hostname: "localhost",
      port: nextJSPort,
      customServer: true,
      allowRetry: false,
      keepAliveTimeout: 5000,
      minimalMode: true,
    });

    return nextJSPort;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
};

app.whenReady().then(async () => {
  await initializeIpcStore();
  createWindow();

  ipcMain.on("ping", () => console.log("pong"));
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
