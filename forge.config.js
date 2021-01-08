const path = require('path');

const windowsIcon = path.join(__dirname, 'public', 'icons', 'win', 'icon.ico');
const linuxIcon = path.join(__dirname, 'public', 'icons', 'png', '512x512.png');

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  packagerConfig: {
    executableName: 'app',
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: { name: 'app', iconUrl: windowsIcon, setupIcon: windowsIcon },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        icon: linuxIcon,
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        icon: linuxIcon,
      },
    },
  ],
};
