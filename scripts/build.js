const shell = require("shelljs");
const fs = require("fs");

function exec(command) {
  const execResult = shell.exec(command);
  console.log(execResult.stdout);
}

fs.rmdirSync("dist", { recursive: true });
exec("tsc --outDir __build");
exec("pkg __build/main.js --out-path dist/");
fs.rmdirSync("__build", { recursive: true });
fs.renameSync("dist/main-linux", "dist/symbit-linux");
fs.renameSync("dist/main-macos", "dist/symbit-macos");
fs.renameSync("dist/main-win.exe", "dist/symbit-windows.exe");
