<p align='center'>
  <h5 align='center'>ABOUT</h5>
  <p align='center'>
    Symbit is a root manager for rooted Android phones via Magisk without TWRP.
  </p>
</p>

<p align='center'>
  <a href='https://example.com'>
    <img src='https://img.shields.io/badge/stability-experimental-orange?style=for-the-badge'>
  </a>
  <a href='https://github.com/raphtlw/zorin/pulls'>
    <img src="https://img.shields.io/badge/PR's-welcome-limegreen?style=for-the-badge&logo=github">
  </a>
  <a href='https://example.com'>
    <img src='https://img.shields.io/badge/build-success-green?style=for-the-badge'>
  </a>
</p>

## Install

- [Linux](https://github.com/raphtlw/symbit/releases/latest/download/symbit-linux)
- [Mac](https://github.com/raphtlw/symbit/releases/latest/download/symbit-macos)
- [Windows](https://github.com/raphtlw/symbit/releases/latest/download/symbit-windows.exe)

NOTE: When downloading the Windows version, there may be a warning telling you that the program is harmful. Just ignore it because it's typical of Windows to do so 😉.

## Usage

### Linux + MacOS

For Linux and MacOS, it's super easy. You just have to open up a terminal in the directory you downloaded the latest version of Symbit from and do `./symbit-linux` and hit enter (or `./symbit-macos`) to run the program. If it doesn't work, you need to give it executable permissions. To do so, just type `chmod +x symbit-linux` (or `chmod +x symbit-macos`) in the terminal and hit enter.

### Windows

For Windows, you'll need to open up a terminal (cmd or powershell) in the directory you downloaded the program, type `symbit-windows.exe` and hit enter. If it doesn't work, just type `.\symbit-windows.exe` to make sure you are running the correct program and not the program in %PATH%.

### Command line arguments

To get a list of commands you can use, follow the usage instructions above and add `--help` to the end of your command. So, if you are using Linux, you would type `./symbit-linux --help` to get help for the Symbit command line program.

The same goes for MacOS &mdash; `./symbit-macos --help`.

### Examples

#### Linux + MacOS
- `./symbit --help` - Lists all the arguments you can specify for the program
- `./symbit update` - Updates your phone to the latest Android version
- `./symbit root` - Root your phone via Magisk

#### Windows

- `symbit.exe --help` - Lists all the arguments you can specify for the program
- `symbit.exe update` - Updates your phone to the latest Android version
- `symbit.exe root` - Root your phone via Magisk

## About

TWRP has not been updated to support the new /system format and rooting has been more difficult. Although rooting with the stock bootloader usually brings more stability and less problems when rooting, it requires one to go through the hassle of typing many commands into the terminal just to be able to root or update their phone. This program aims to solve that problem.

## Supported devices

- Google Pixel 1
- Google Pixel 1 XL
- Google Pixel 2
- Google Pixel 2 XL
- Google Pixel 3
- Google Pixel 3 XL
- Google Pixel 3a
- Google Pixel 3a XL
- Google Pixel 4
- Google Pixel 4 XL
- Google Pixel 4a
- Google Pixel 4a XL
- Google Pixel 5
- Google Pixel 5 XL

## Contributing

Contributions are always welcome. If you feel inclined to, feel free to submit a pull request.

In addition, you can also contribute by submitting issues. Please describe the issue with enough details and I will solve them as soon as I can.
