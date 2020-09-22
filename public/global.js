"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.fastboot = exports.adb = exports.indoc = exports.printError = exports.Log = exports.STRINGS = exports.ACTIONS = exports.SUPPORTED_DEVICE_TYPES = exports.MAGISK_MANAGER_APK_PATH = exports.PLATFORM_TOOLS_DIR = exports.LOG_PATH = exports.LOG_DIR = exports.DIR = exports.navigate = exports.pageHistory = exports.currentPage = void 0;
var window = window || { require: require };
var store_1 = require("svelte/store");
var remote = window.require("electron").remote;
var path = window.require("path");
var child_process = window.require("child_process");
var exec = child_process.execSync;
var fs = window.require("fs");
// GLOBAL VALUES
// -----------------------------------------------
//
exports.currentPage = store_1.writable({ title: "Symbit", id: "index" });
exports.pageHistory = store_1.writable([{ title: "Symbit", id: "index" }]);
function navigate(page) {
    exports.currentPage.set(page);
    exports.pageHistory.update(function (value) {
        if (page !== value[value.length - 1]) {
            value.push(page);
        }
        return value;
    });
}
exports.navigate = navigate;
exports.DIR = path.join(remote.app.getPath("temp"), "symbit");
exports.LOG_DIR = path.join(exports.DIR, ".logs");
exports.LOG_PATH = path.join(exports.LOG_DIR, "symbit-" + new Date().valueOf().toString() + ".log");
exports.PLATFORM_TOOLS_DIR = path.join(exports.DIR, "platform-tools");
exports.MAGISK_MANAGER_APK_PATH = path.join(exports.DIR, "magisk-manager.apk");
var SUPPORTED_DEVICE_TYPES;
(function (SUPPORTED_DEVICE_TYPES) {
    SUPPORTED_DEVICE_TYPES["GOOGLE_PIXEL"] = "Google Pixel";
    SUPPORTED_DEVICE_TYPES["ONEPLUS"] = "OnePlus";
})(SUPPORTED_DEVICE_TYPES = exports.SUPPORTED_DEVICE_TYPES || (exports.SUPPORTED_DEVICE_TYPES = {}));
var ACTIONS;
(function (ACTIONS) {
    ACTIONS["UPDATE"] = "update";
    ACTIONS["ROOT"] = "root";
})(ACTIONS = exports.ACTIONS || (exports.ACTIONS = {}));
exports.STRINGS = {
    unsupported_device: "Unfortunately your device has not been supported yet 😕",
    enable_developer_options: indoc(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    1. Go to settings > about phone\n    2. Tap \"build number\" 7 times\n  "], ["\n    1. Go to settings > about phone\n    2. Tap \"build number\" 7 times\n  "]))),
    enable_usb_debugging: indoc(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n    1. Go to the Developer Options menu\n    2. Scroll down to find \"USB Debugging\"\n    3. Flip the switch and you're good to go!\n  "], ["\n    1. Go to the Developer Options menu\n    2. Scroll down to find \"USB Debugging\"\n    3. Flip the switch and you're good to go!\n  "]))),
    enable_oem_unlocking: indoc(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n    Instructions for enabling OEM unlocking\n    ---\n    1. Go to the Developer Options menu\n    2. Scroll down to find \"OEM Unlocking\"\n    3. Flip the switch and you're good to go!\n  "], ["\n    Instructions for enabling OEM unlocking\n    ---\n    1. Go to the Developer Options menu\n    2. Scroll down to find \"OEM Unlocking\"\n    3. Flip the switch and you're good to go!\n  "]))),
    adb_always_allow: indoc(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n    Please check the 'always allow' option for ADB\n    if you see a popup asking you to allow this PC to connect with ADB.\n  "], ["\n    Please check the 'always allow' option for ADB\n    if you see a popup asking you to allow this PC to connect with ADB.\n  "]))),
    tip_drag_folder_into_terminal: indoc(templateObject_5 || (templateObject_5 = __makeTemplateObject(["TIP: You can drag and drop the folder into the terminal"], ["TIP: You can drag and drop the folder into the terminal"]))),
    patch_boot_image_file_instructions: indoc(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n    Now you'll need to patch the boot image file using the Magisk Manager app\n    on your Android device.\n\n    1. Open Magisk\n    2. Tap 'install'\n    3. Tap 'install' again\n    4. Tap 'Select and Patch a File'\n    5. Go to the root of your Pixel's file manager\n       and select the boot.img file\n    NOTE: After patching the boot.img, DO NOT REBOOT.\n  "], ["\n    Now you'll need to patch the boot image file using the Magisk Manager app\n    on your Android device.\n\n    1. Open Magisk\n    2. Tap 'install'\n    3. Tap 'install' again\n    4. Tap 'Select and Patch a File'\n    5. Go to the root of your Pixel's file manager\n       and select the boot.img file\n    NOTE: After patching the boot.img, DO NOT REBOOT.\n  "]))),
    install_python_instructions: indoc(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n    You'll need to install Python on your system. Get it here:\n    https://www.python.org/downloads/\n    If you are using Linux, you know what to do \uD83D\uDE09\n  "], ["\n    You'll need to install Python on your system. Get it here:\n    https://www.python.org/downloads/\n    If you are using Linux, you know what to do \uD83D\uDE09\n  "]))),
    magisk_canary_instructions: indoc(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n    You can install Magisk Canary by:\n    1. Updating your existing Magisk to the canary channel (recommended)\n    2. Installing the canary version of Magisk Manager\n  "], ["\n    You can install Magisk Canary by:\n    1. Updating your existing Magisk to the canary channel (recommended)\n    2. Installing the canary version of Magisk Manager\n  "]))),
    magisk_canary_instructions_update_existing: indoc(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n    To move your existing installation to the Canary channel,\n    1. Open Magisk Manager\n    2. Go to the settings page\n    3. Scroll down and tap on \"Update Channel\"\n    4. Tap \"Custom Channel\"\n    5. In the input box, type https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/debug.json\n  "], ["\n    To move your existing installation to the Canary channel,\n    1. Open Magisk Manager\n    2. Go to the settings page\n    3. Scroll down and tap on \"Update Channel\"\n    4. Tap \"Custom Channel\"\n    5. In the input box, type https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/debug.json\n  "]))),
    magisk_canary_instructions_install_new: indoc(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n    You can install the canary version of Magisk here:\n    https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/app-debug.apk\n  "], ["\n    You can install the canary version of Magisk here:\n    https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/app-debug.apk\n  "])))
};
// HELPER FUNCTIONS
// ------------------------------------------
//
var Log = /** @class */ (function () {
    function Log() {
    }
    Log.getTime = function () {
        var date = new Date();
        return "[" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]";
    };
    Log.logFile = function (_) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                fs.writeFile(exports.LOG_PATH, String(_), function (err) {
                    if (err)
                        throw err;
                });
                return [2 /*return*/];
            });
        });
    };
    Log.d = function (_) {
        var message = this.getTime() + " [debug] " + _;
        this.logFile(message);
        console.log(message);
    };
    Log.i = function (_) {
        var message = this.getTime() + " [info] " + _;
        this.logFile(message);
        console.log(message);
    };
    Log.w = function (_) {
        var message = this.getTime() + " [warning] " + _;
        this.logFile(message);
        console.log(message);
    };
    Log.e = function (_) {
        var message = this.getTime() + " [ERROR] " + _;
        this.logFile(message);
        console.log(message);
    };
    Log.f = function (_) {
        var message = this.getTime() + " [FATAL] " + _;
        this.logFile(message);
        console.log(message);
    };
    return Log;
}());
exports.Log = Log;
/**
 * Throws an error to the user
 */
function printError(message) {
    console.log(message);
    process.exit(1);
}
exports.printError = printError;
/**
 * # Indented Documents
 *
 * Template literal function to generate unindented strings
 *
 * @example
 * indoc`
 *   test
 * `
 * // output: `test`
 */
function indoc(document) {
    // console.log(document[0].split("\n"));
    return document[0]
        .split("\n")
        .map(function (item) { return item.trim(); })
        .filter(function (item) { return item.length > 0; })
        .join("\n");
}
exports.indoc = indoc;
/**
 * Ask for input from the user
 */
// export async function input(message: string): Promise<string> {
//   const { response } = await inquirer.prompt([
//     { type: "input", name: "response", message: message },
//   ]);
//   return response;
// }
/**
 * Ask for input from the user
 */
// export async function inputConfirmation(message: string): Promise<boolean> {
//   const { confirmation } = await inquirer.prompt([
//     { type: "confirm", name: "confirmation", message: message },
//   ]);
//   return confirmation;
// }
/**
 * Ask for input from the user
 */
// export async function inputChoice(
//   message: string,
//   choices: string[]
// ): Promise<string> {
//   const { choice } = await inquirer.prompt([
//     { type: "list", name: "choice", message: message, choices: choices },
//   ]);
//   return choice;
// }
/**
 * Run ADB on the shell
 */
function adb() {
    var command = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        command[_i] = arguments[_i];
    }
    if (process.platform === "win32")
        exec(exports.PLATFORM_TOOLS_DIR + "\\adb.exe " + command.join(" "), {
            stdio: "inherit"
        });
    else if (process.platform === "linux" || process.platform === "darwin")
        exec(exports.PLATFORM_TOOLS_DIR + "/adb " + command.join(" "), {
            stdio: "inherit"
        });
}
exports.adb = adb;
/**
 * Run Fastboot on the shell
 */
function fastboot() {
    var command = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        command[_i] = arguments[_i];
    }
    if (process.platform === "win32")
        exec(exports.PLATFORM_TOOLS_DIR + "\\fastboot.exe " + command.join(" "), {
            stdio: "inherit"
        });
    else if (process.platform === "linux" || process.platform === "darwin")
        exec(exports.PLATFORM_TOOLS_DIR + "/fastboot " + command.join(" "), {
            stdio: "inherit"
        });
}
exports.fastboot = fastboot;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10;
//# sourceMappingURL=global.js.map