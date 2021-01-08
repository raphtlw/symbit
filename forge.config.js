const path = require("path")

const windowsIcon = path.join(__dirname, "public", "icons", "win", "icon.ico")
const linuxIcon = path.join(__dirname, "public", "icons", "png", "512x512.png")
const macIcon = path.join(__dirname, "public", "icons", "mac", "icon.icns")

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  packagerConfig: {
    executableName: "symbit",
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: { name: "symbit", iconUrl: windowsIcon, setupIcon: windowsIcon },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin", "linux"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        icon: linuxIcon,
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        icon: linuxIcon,
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        icon: macIcon,
      },
    },
  ],
}
