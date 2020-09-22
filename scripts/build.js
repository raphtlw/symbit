const shell = require("shelljs");
const fs = require("fs");
const AdmZip = require("adm-zip");
const path = require("path");

const tmp = "__build";
const target = "dist";

fs.rmdirSync("dist", { recursive: true });

shell.exec(`tsc --outDir ${tmp}`);
shell.exec(`pkg ${path.join(tmp, "main.js")} --out-path ${tmp}`);

fs.mkdirSync(path.join(tmp, "linux"));
fs.mkdirSync(path.join(tmp, "macos"));
fs.mkdirSync(path.join(tmp, "windows"));
fs.renameSync(path.join(tmp, "main-linux"), path.join(tmp, "linux", "symbit"));
fs.renameSync(path.join(tmp, "main-macos"), path.join(tmp, "macos", "symbit"));
fs.renameSync(
  path.join(tmp, "main-win.exe"),
  path.join(tmp, "windows", "symbit.exe")
);
shell.cp("-r", "lib", path.join(tmp, "linux"));
shell.cp("-r", "lib", path.join(tmp, "macos"));
shell.cp("-r", "lib", path.join(tmp, "windows"));

fs.mkdirSync(target);

const linuxZip = new AdmZip();
linuxZip.addLocalFolder(path.join(tmp, "linux"));
linuxZip.writeZip(path.join(target, "linux.zip"));

const macosZip = new AdmZip();
macosZip.addLocalFolder(path.join(tmp, "macos"));
macosZip.writeZip(path.join(target, "macos.zip"));

const windowsZip = new AdmZip();
windowsZip.addLocalFolder(path.join(tmp, "windows"));
windowsZip.writeZip(path.join(target, "windows.zip"));

fs.rmdirSync(tmp, { recursive: true });
