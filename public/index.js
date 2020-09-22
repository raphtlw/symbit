"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line
if (require("electron-squirrel-startup")) {
    electron_1.app.quit();
}
var createWindow = function () {
    var mainWindow = new electron_1.BrowserWindow({
        height: 500,
        width: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            worldSafeExecuteJavaScript: true
        }
    });
    mainWindow.loadFile(path.join(__dirname, "index.html"));
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", createWindow);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// Enable live reload when in development
// eslint-disable-next-line
require("electron-is-dev") &&
    require("electron-reload")(__dirname, {
        electron: path.join(__dirname, "../node_modules", ".bin", "electron"),
        awaitWriteFinish: true
    });
//# sourceMappingURL=index.js.map