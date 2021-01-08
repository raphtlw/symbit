/* eslint-disable @typescript-eslint/no-var-requires */

import { app, BrowserWindow } from "electron"
import * as path from "path"

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit()
}

const createWindow = (): void => {
  // Cross platform solution for icons
  // Use `npx electron-icon-maker --input=./icon.png --output=./public`
  // to create the icons
  let icon: string
  if (process.platform === "linux") {
    icon = path.join(app.getAppPath(), "public", "icons", "png", "512x512.png")
  } else if (process.platform === "win32") {
    icon = path.join(app.getAppPath(), "public", "icons", "win", "icon.ico")
  } else if (process.platform === "darwin") {
    icon = path.join(app.getAppPath(), "public", "icons", "mac", "icon.icns")
  }

  const mainWindow = new BrowserWindow({
    height: 500,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: true,
    },
    icon,
  })
  mainWindow.loadFile(path.join(app.getAppPath(), "public", "index.html"))
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Hot reloading
try {
  require("electron-reloader")(module)
} catch (_) {}
